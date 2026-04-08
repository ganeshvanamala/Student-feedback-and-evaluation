import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Student.css";
import {
  countStudentSubmittedFeedback,
  getAvailableFormsForStudent,
  getStudentRepliesForUser,
} from "../domain/selectors";
import { fetchFormsByCategory } from "../api/formsApi";
import { clearSession, getCurrentUser, getSession, setSession } from "../auth/session";
import { fetchReplies, markRepliesRead } from "../api/repliesApi";
import { fetchComplaints } from "../api/complaintsApi";
import { logoutUser, updatePassword } from "../api/usersApi";
import { completeGoogleProfile } from "../api/authApi";
import { DEPARTMENTS, getDepartmentNameById } from "../utils/departments";

const Student = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("homeTheme") || "light");
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [studentUser, setStudentUser] = useState(null);
  const [forms, setForms] = useState([]);
  const [replies, setReplies] = useState([]);
  const [newForms, setNewForms] = useState([]);
  const [stats, setStats] = useState({ submittedFeedback: 0, submittedComplaints: 0 });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [formsLoading, setFormsLoading] = useState(true);
  const [formsError, setFormsError] = useState("");
  const [profileCompletionForm, setProfileCompletionForm] = useState({
    fullName: "",
    studentId: "",
    departmentId: "",
    year: "",
  });
  const [profileCompletionMessage, setProfileCompletionMessage] = useState("");
  const [profileCompletionSaving, setProfileCompletionSaving] = useState(false);
  const [profileLockMessage, setProfileLockMessage] = useState("");
  const seenFormIdsRef = useRef(new Set());

  const currentStudent = useMemo(() => getCurrentUser().username || "", []);
  const getEffectiveDepartmentId = (user) => user?.departmentId || user?.departmentIds?.[0] || "";
  const normalizeMissingText = (value) => {
    const text = String(value ?? "").trim();
    if (!text) return "";
    if (text.toLowerCase() === "not provided") return "";
    if (text.toLowerCase() === "null") return "";
    if (text.toLowerCase() === "undefined") return "";
    return text;
  };
  const normalizeYearValue = (value) => {
    const text = normalizeMissingText(value);
    if (!text) return null;
    const parsed = Number(text);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 4) return null;
    return parsed;
  };
  const hasValidYear = (year) => {
    const parsed = Number(year);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 4;
  };
  const isProfileComplete = (user) =>
    Boolean(
      user &&
      (user.fullName || "").trim() &&
      (user.studentId || "").trim() &&
      getEffectiveDepartmentId(user) &&
      hasValidYear(user.year)
    );

  const loadData = async () => {
    const loggedInUser = getCurrentUser();

    if (!currentStudent || !loggedInUser || loggedInUser.role !== "student") {
      navigate("/");
      return;
    }

    const profileDefaults = {
      fullName: "Not provided",
      studentId: "Not provided",
      email: "Not provided",
      department: "Not provided",
      year: "Not provided",
    };

    const fullName = normalizeMissingText(loggedInUser.fullName || loggedInUser.profile?.fullName);
    const studentId = normalizeMissingText(loggedInUser.studentId || loggedInUser.profile?.studentId);
    const email = normalizeMissingText(loggedInUser.email || loggedInUser.profile?.email);
    const departmentId = normalizeMissingText(getEffectiveDepartmentId(loggedInUser));
    const year = normalizeYearValue(loggedInUser.year || loggedInUser.profile?.year);

    setStudentUser({
      id: loggedInUser.id || loggedInUser.userId || loggedInUser.username || "",
      username: loggedInUser.username,
      password: loggedInUser.password || "",
      role: loggedInUser.role || "student",
      fullName,
      email,
      studentId,
      departmentId,
      departmentIds: loggedInUser.departmentIds || (departmentId ? [departmentId] : []),
      year,
      subjectIds: loggedInUser.subjectIds || [],
      profile: {
        ...profileDefaults,
        fullName: fullName || profileDefaults.fullName,
        studentId: studentId || profileDefaults.studentId,
        email: email || profileDefaults.email,
        department:
          loggedInUser.profile?.department ||
          getDepartmentNameById(departmentId, departmentId || profileDefaults.department),
        year: year || profileDefaults.year,
      },
    });
    setProfileCompletionForm({
      fullName,
      studentId,
      departmentId,
      year: year ? String(year) : "",
    });
    setProfileCompletionMessage("");

    setFormsLoading(true);
    setFormsError("");

    try {
      const [adminForms, allReplies, allComplaints] = await Promise.all([
        fetchFormsByCategory(),
        fetchReplies(currentStudent),
        fetchComplaints(),
      ]);

      const availableForms = getAvailableFormsForStudent(adminForms);
      setForms(availableForms);

      const myReplies = getStudentRepliesForUser(allReplies, currentStudent);
      setReplies(myReplies);

      const feedbackCount = countStudentSubmittedFeedback(adminForms, currentStudent);
      const complaintsCount = (Array.isArray(allComplaints) ? allComplaints : []).filter(
        (item) => item?.submittedBy === currentStudent
      ).length;

      setStats({
        submittedFeedback: feedbackCount,
        submittedComplaints: complaintsCount,
      });

      const unseen = availableForms.filter((form) => !seenFormIdsRef.current.has(form.id));
      setNewForms(activeMenu === "dashboard" ? [] : unseen);

      if (activeMenu === "dashboard") {
        availableForms.forEach((form) => seenFormIdsRef.current.add(form.id));
      }
    } catch (error) {
      console.error("API FAILED", error);
      setFormsError("Unable to load student data from server.");
      setForms([]);
      setReplies([]);
      setStats({ submittedFeedback: 0, submittedComplaints: 0 });
    } finally {
      setFormsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeMenu]);

  useEffect(() => {
    if (!studentUser) return;
    if (!isProfileComplete(studentUser) && activeMenu !== "profile") {
      setActiveMenu("profile");
      setProfileLockMessage("Complete your profile first to unlock dashboard, feedback, complaints, and responses.");
    }
  }, [studentUser, activeMenu]);

  useEffect(() => {
    const onThemeChange = (event) => {
      setTheme(event?.detail || localStorage.getItem("homeTheme") || "light");
    };
    const onStorage = (event) => {
      if (event.key === "homeTheme") setTheme(event.newValue || "light");
    };
    window.addEventListener("site-theme-change", onThemeChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("site-theme-change", onThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (activeMenu !== "responses" || !currentStudent) {
      return;
    }

    const hasUnread = replies.some((reply) => !reply.isRead);
    if (!hasUnread) {
      return;
    }

    const markRead = async () => {
      try {
        const updatedReplies = await markRepliesRead(currentStudent);
        setReplies(
          updatedReplies
            .filter((reply) => reply.targetUser === currentStudent)
            .sort((a, b) => (b.id || 0) - (a.id || 0))
        );
      } catch (error) {
        console.error("API FAILED", error);
      }
    };

    markRead();
  }, [activeMenu, currentStudent, replies]);

  const unreadReplies = replies.filter((reply) => !reply.isRead).length;

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("homeTheme", nextTheme);
    window.dispatchEvent(new CustomEvent("site-theme-change", { detail: nextTheme }));
  };

  const navigateComplaint = (category) => {
    if (!studentUser) return;
    if (!isProfileComplete(studentUser)) {
      setActiveMenu("profile");
      setProfileLockMessage("Complete your profile first to continue.");
      return;
    }

    if (category === "academics") {
      navigate("/academics-complaint");
      return;
    }

    const state = {
      name: studentUser.profile.fullName,
      id: studentUser.profile.studentId,
    };

    if (category === "sports") {
      navigate("/sports-complaint", { state });
      return;
    }

    if (category === "hostel") {
      navigate("/hostel-complaint", { state });
    }
  };

  const navigateFeedback = (category) => {
    if (!isProfileComplete(studentUser)) {
      setActiveMenu("profile");
      setProfileLockMessage("Complete your profile first to continue.");
      return;
    }
    if (category === "academics") navigate("/academics");
    if (category === "sports") navigate("/sports-feedback");
    if (category === "hostel") navigate("/hostel-feedback");
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (!studentUser) return;

    if (passwordForm.next.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      alert("New password and confirmation do not match.");
      return;
    }

    try {
      await updatePassword({
        username: studentUser.username,
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });

      const existingSession = getSession();
      setStudentUser((prev) => ({ ...prev, password: passwordForm.next }));
      setSession(
        { ...getCurrentUser(), password: passwordForm.next },
        existingSession?.token || null,
        existingSession?.expiresAt || null
      );
      setPasswordForm({ current: "", next: "", confirm: "" });
      alert("Password updated successfully.");
    } catch (error) {
      console.error("API FAILED", error);
      alert(error?.message || "Unable to update password.");
    }
  };

  const missingProfileFields = useMemo(() => {
    if (!studentUser) return [];
    const missing = [];
    if (!(studentUser.fullName || "").trim()) missing.push("fullName");
    if (!(studentUser.studentId || "").trim()) missing.push("studentId");
    if (!getEffectiveDepartmentId(studentUser)) missing.push("departmentId");
    if (!hasValidYear(studentUser.year)) missing.push("year");
    return missing;
  }, [studentUser]);
  const profileIncomplete = missingProfileFields.length > 0;

  const handleCompleteProfile = async (event) => {
    event.preventDefault();
    if (!studentUser) return;
    if (!missingProfileFields.length) {
      setProfileCompletionMessage("Profile is already completed.");
      return;
    }

    if (missingProfileFields.includes("studentId") && !profileCompletionForm.studentId.trim()) {
      setProfileCompletionMessage("Student ID is required.");
      return;
    }
    if (
      missingProfileFields.includes("studentId") &&
      !/^[A-Za-z0-9-]{3,30}$/.test(profileCompletionForm.studentId.trim())
    ) {
      setProfileCompletionMessage("Student ID must be 3-30 letters, numbers, or hyphen.");
      return;
    }
    if (missingProfileFields.includes("fullName") && !profileCompletionForm.fullName.trim()) {
      setProfileCompletionMessage("Full Name is required.");
      return;
    }
    if (missingProfileFields.includes("departmentId") && !profileCompletionForm.departmentId) {
      setProfileCompletionMessage("Department is required.");
      return;
    }
    if (missingProfileFields.includes("year") && !profileCompletionForm.year) {
      setProfileCompletionMessage("Year is required.");
      return;
    }

    const payload = {
      username: studentUser.username,
    };
    if (missingProfileFields.includes("fullName") && profileCompletionForm.fullName.trim()) {
      payload.fullName = profileCompletionForm.fullName.trim();
    }
    if (missingProfileFields.includes("studentId")) {
      payload.studentId = profileCompletionForm.studentId.trim();
    }
    if (missingProfileFields.includes("departmentId")) {
      payload.departmentId = profileCompletionForm.departmentId;
    }
    if (missingProfileFields.includes("year")) {
      payload.year = String(profileCompletionForm.year);
    }

    setProfileCompletionSaving(true);
    setProfileCompletionMessage("");
    try {
      const updatedUser = await completeGoogleProfile(payload);
      const updatedDepartmentId = getEffectiveDepartmentId(updatedUser);
      const nextSessionUser = {
        ...updatedUser,
        id: updatedUser?.id || updatedUser?.userId || updatedUser?.username || studentUser.username,
        username: updatedUser?.username || updatedUser?.email || studentUser.username,
        role: String(updatedUser?.role || "student").toLowerCase(),
        departmentId: updatedDepartmentId,
        departmentIds: updatedUser?.departmentIds || (updatedDepartmentId ? [updatedDepartmentId] : []),
        subjectIds: updatedUser?.subjectIds || [],
        studentId: updatedUser?.studentId || null,
        profile: {
          fullName: updatedUser?.fullName || "Not provided",
          studentId: updatedUser?.studentId || "Not provided",
          email: updatedUser?.email || "Not provided",
          department: getDepartmentNameById(updatedDepartmentId, updatedDepartmentId || "Not provided"),
          year: updatedUser?.year || "Not provided",
        },
      };

      const existingSession = getSession();
      setSession(nextSessionUser, existingSession?.token || null, existingSession?.expiresAt || null);
      setProfileCompletionMessage("Profile saved successfully.");
      setProfileLockMessage("");
      setStudentUser({
        id: nextSessionUser.id,
        username: nextSessionUser.username,
        password: studentUser.password || "",
        role: nextSessionUser.role,
        fullName: updatedUser?.fullName || "",
        email: updatedUser?.email || "",
        studentId: updatedUser?.studentId || "",
        departmentId: updatedDepartmentId,
        departmentIds: nextSessionUser.departmentIds,
        year: updatedUser?.year || null,
        subjectIds: nextSessionUser.subjectIds,
        profile: nextSessionUser.profile,
      });
      setProfileCompletionForm({
        fullName: updatedUser?.fullName || "",
        studentId: updatedUser?.studentId || "",
        departmentId: updatedDepartmentId,
        year: updatedUser?.year ? String(updatedUser.year) : "",
      });
    } catch (error) {
      console.error("API FAILED", error);
      setProfileCompletionMessage(error?.message || "Unable to save profile.");
    } finally {
      setProfileCompletionSaving(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("API FAILED", error);
    }
    clearSession();
    navigate("/");
  };

  if (!studentUser) {
    return null;
  }

  return (
    <div className={`student-layout theme-${theme} ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className="student-sidebar">
        <div className="sidebar-head">
          <h2>Student Panel</h2>
          <button className="sidebar-menu-btn" onClick={() => setSidebarOpen((prev) => !prev)}>
            Menu
          </button>
        </div>
        <button
          className={`sidebar-item ${activeMenu === "dashboard" ? "active" : ""}`}
          onClick={() => {
            if (profileIncomplete) {
              setActiveMenu("profile");
              setProfileLockMessage("Complete your profile first to access dashboard.");
              return;
            }
            setActiveMenu("dashboard");
            setExpandedMenu(null);
          }}
          disabled={profileIncomplete}
        >
          Dashboard
        </button>

        <div className="menu-group">
          <button
            className={`sidebar-item ${expandedMenu === "complaints" ? "active" : ""}`}
            onClick={() => {
              if (profileIncomplete) {
                setActiveMenu("profile");
                setProfileLockMessage("Complete your profile first to access complaints.");
                return;
              }
              setExpandedMenu((prev) => (prev === "complaints" ? null : "complaints"));
            }}
            aria-expanded={expandedMenu === "complaints"}
            disabled={profileIncomplete}
          >
            <span>Complaints</span>
            <span className="menu-caret">{expandedMenu === "complaints" ? "-" : "+"}</span>
          </button>
          <div className={`submenu-wrap ${expandedMenu === "complaints" ? "open" : "closed"}`}>
            <button className="sidebar-item submenu-item" onClick={() => navigateComplaint("academics")} disabled={profileIncomplete}>Academics</button>
            <button className="sidebar-item submenu-item" onClick={() => navigateComplaint("sports")} disabled={profileIncomplete}>Sports</button>
            <button className="sidebar-item submenu-item" onClick={() => navigateComplaint("hostel")} disabled={profileIncomplete}>Hostel</button>
          </div>
        </div>

        <div className="menu-group">
          <button
            className={`sidebar-item ${expandedMenu === "feedback" ? "active" : ""}`}
            onClick={() => {
              if (profileIncomplete) {
                setActiveMenu("profile");
                setProfileLockMessage("Complete your profile first to access feedback.");
                return;
              }
              setExpandedMenu((prev) => (prev === "feedback" ? null : "feedback"));
            }}
            aria-expanded={expandedMenu === "feedback"}
            disabled={profileIncomplete}
          >
            <span>Feedback</span>
            <span className="menu-caret">{expandedMenu === "feedback" ? "-" : "+"}</span>
          </button>
          <div className={`submenu-wrap ${expandedMenu === "feedback" ? "open" : "closed"}`}>
            <button className="sidebar-item submenu-item" onClick={() => navigateFeedback("academics")} disabled={profileIncomplete}>Academics</button>
            <button className="sidebar-item submenu-item" onClick={() => navigateFeedback("sports")} disabled={profileIncomplete}>Sports</button>
            <button className="sidebar-item submenu-item" onClick={() => navigateFeedback("hostel")} disabled={profileIncomplete}>Hostel</button>
          </div>
        </div>

        <button
          className={`sidebar-item ${activeMenu === "responses" ? "active" : ""}`}
          onClick={() => {
            if (profileIncomplete) {
              setActiveMenu("profile");
              setProfileLockMessage("Complete your profile first to access responses.");
              return;
            }
            setActiveMenu("responses");
            setExpandedMenu(null);
          }}
          disabled={profileIncomplete}
        >
          Responses {unreadReplies > 0 ? `(${unreadReplies})` : ""}
        </button>
      </aside>

      <main className="student-main">
        <header className="student-topbar">
          <div>
            <h1>Welcome, {studentUser.profile.fullName}</h1>
            <p>{studentUser.username}</p>
          </div>
          <div className="topbar-actions">
            <button className="menu-toggle" onClick={() => setSidebarOpen((prev) => !prev)}>
              Menu
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
            <button className="action-btn" onClick={() => setActiveMenu("profile")}>
              Profile {profileIncomplete ? "(!)" : ""}
            </button>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <section className="student-content">
          {profileIncomplete && (
            <div className="profile-alert-banner">
              {profileLockMessage ||
                "Profile incomplete. Complete required details (especially Student ID) to unlock all student features."}
            </div>
          )}
          {activeMenu === "dashboard" && (
            <div className="dashboard-grid">
              <div className="stat-card">
                <h3>Available Forms</h3>
                <p>{forms.length}</p>
              </div>
              <div className="stat-card">
                <h3>New Forms</h3>
                <p>{newForms.length}</p>
              </div>
              <div className="stat-card">
                <h3>Unread Replies</h3>
                <p>{unreadReplies}</p>
              </div>
              <div className="stat-card">
                <h3>Your Submissions</h3>
                <p>{stats.submittedFeedback + stats.submittedComplaints}</p>
              </div>

              <div className="panel-card">
                <h3>Latest Forms</h3>
                {formsLoading && <p>Loading forms...</p>}
                {!formsLoading && formsError && <p>{formsError}</p>}
                {!formsLoading && forms.length === 0 ? (
                  <p>No forms available yet.</p>
                ) : forms.length > 0 ? (
                  <ul>
                    {forms.slice(0, 5).map((form) => (
                      <li key={form.id}>
                        <span>{form.title}</span>
                        <small>{form.category}</small>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="panel-card">
                <h3>Recent Admin Replies</h3>
                {replies.length === 0 ? (
                  <p>No replies from admin yet.</p>
                ) : (
                  <ul>
                    {replies.slice(0, 5).map((reply) => (
                      <li key={reply.id}>
                        <span>{reply.message}</span>
                        <small>{reply.category} | {reply.createdAt}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeMenu === "responses" && (
            <div className="panel-card full">
              <h3>Admin Responses</h3>
              {replies.length === 0 ? (
                <p>No responses yet.</p>
              ) : (
                <div className="responses-list">
                  {replies.map((reply) => (
                    <article key={reply.id} className="response-item">
                      <header>
                        <strong>{reply.type === "complaint" ? "Complaint Reply" : "Feedback Reply"}</strong>
                        <span>{reply.createdAt}</span>
                      </header>
                      <p>{reply.message}</p>
                      <small>Category: {reply.category}</small>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === "profile" && (
            <div className="profile-grid">
              <div className="panel-card">
                <h3>Basic Details</h3>
                <div className="profile-row"><span>Full Name</span><strong>{studentUser.profile.fullName}</strong></div>
                <div className="profile-row"><span>Student ID</span><strong>{studentUser.profile.studentId}</strong></div>
                <div className="profile-row"><span>Email</span><strong>{studentUser.profile.email}</strong></div>
                <div className="profile-row"><span>Department</span><strong>{studentUser.profile.department}</strong></div>
                <div className="profile-row"><span>Year</span><strong>{studentUser.profile.year}</strong></div>
                <div className="profile-row"><span>Username</span><strong>{studentUser.username}</strong></div>
              </div>

              <div className="panel-card">
                <h3>Complete Profile</h3>
                {!missingProfileFields.length ? (
                  <p className="profile-note">Profile already completed. These values are locked.</p>
                ) : (
                  <form className="profile-completion-form" onSubmit={handleCompleteProfile}>
                    <p className="profile-help">Fill only missing details. Existing values cannot be changed.</p>
                    {missingProfileFields.includes("fullName") && (
                      <>
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={profileCompletionForm.fullName}
                          onChange={(e) =>
                            setProfileCompletionForm((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                          placeholder="Enter full name"
                          required
                        />
                      </>
                    )}
                    {missingProfileFields.includes("studentId") && (
                      <>
                        <label>Student ID</label>
                        <input
                          type="text"
                          value={profileCompletionForm.studentId}
                          onChange={(e) =>
                            setProfileCompletionForm((prev) => ({ ...prev, studentId: e.target.value }))
                          }
                          placeholder="Enter student ID"
                          required
                        />
                      </>
                    )}
                    {missingProfileFields.includes("departmentId") && (
                      <>
                        <label>Department</label>
                        <select
                          value={profileCompletionForm.departmentId}
                          onChange={(e) =>
                            setProfileCompletionForm((prev) => ({ ...prev, departmentId: e.target.value }))
                          }
                          required
                        >
                          <option value="">Select department</option>
                          {DEPARTMENTS.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    {missingProfileFields.includes("year") && (
                      <>
                        <label>Year</label>
                        <select
                          value={profileCompletionForm.year}
                          onChange={(e) =>
                            setProfileCompletionForm((prev) => ({ ...prev, year: e.target.value }))
                          }
                          required
                        >
                          <option value="">Select year</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </>
                    )}

                    {profileCompletionMessage && (
                      <p className="profile-message">{profileCompletionMessage}</p>
                    )}
                    <button type="submit" className="action-btn" disabled={profileCompletionSaving}>
                      {profileCompletionSaving ? "Saving..." : "Save Missing Details"}
                    </button>
                  </form>
                )}
              </div>

              <div className="panel-card">
                <h3>Change Password</h3>
                <form className="password-form" onSubmit={handlePasswordChange}>
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                    required
                  />

                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, next: e.target.value }))}
                    required
                  />

                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
                    required
                  />

                  <button type="submit" className="action-btn" disabled={profileIncomplete}>
                    Update Password
                  </button>
                </form>
                {profileIncomplete && (
                  <p className="profile-note" style={{ marginTop: 8 }}>
                    Password change is locked until profile completion.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Student;
