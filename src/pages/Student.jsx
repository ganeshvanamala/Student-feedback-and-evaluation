import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Student.css";

const parseJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const flattenForms = (rawForms) =>
  Object.values(rawForms || {}).flatMap((entry) => {
    if (!entry) return [];
    return Array.isArray(entry) ? entry : [entry];
  });

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

  const currentStudent = useMemo(() => localStorage.getItem("currentStudent") || "", []);

  const loadData = () => {
    const registeredUsers = parseJSON("registeredUsers", []);
    const loggedInUser = registeredUsers.find((u) => u.username === currentStudent);

    if (!currentStudent || !loggedInUser) {
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

    setStudentUser({
      username: loggedInUser.username,
      password: loggedInUser.password,
      profile: { ...profileDefaults, ...(loggedInUser.profile || {}) },
    });

    const adminForms = parseJSON("adminForms", {});
    const availableForms = flattenForms(adminForms).sort((a, b) => (b.id || 0) - (a.id || 0));
    setForms(availableForms);

    const allReplies = parseJSON("studentReplies", []);
    const myReplies = allReplies
      .filter((reply) => reply.targetUser === currentStudent)
      .sort((a, b) => (b.id || 0) - (a.id || 0));
    setReplies(myReplies);

    let feedbackCount = 0;
    flattenForms(adminForms).forEach((form) => {
      (form.responses || []).forEach((response) => {
        if (response.submittedBy === currentStudent) feedbackCount += 1;
      });
    });

    const complaintsCount = [
      ...parseJSON("academicsComplaints", []),
      ...parseJSON("sportsComplaints", []),
      ...parseJSON("hostelComplaints", []),
    ].filter((item) => item.submittedBy === currentStudent).length;

    setStats({
      submittedFeedback: feedbackCount,
      submittedComplaints: complaintsCount,
    });

    const seenKey = `studentSeenForms_${currentStudent}`;
    const seenForms = parseJSON(seenKey, []);
    const unseen = availableForms.filter((form) => !seenForms.includes(form.id));
    setNewForms(unseen);

    if (activeMenu === "dashboard" && availableForms.length > 0) {
      localStorage.setItem(seenKey, JSON.stringify(availableForms.map((form) => form.id)));
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu]);

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

    const allReplies = parseJSON("studentReplies", []);
    const hasUnread = allReplies.some((reply) => reply.targetUser === currentStudent && !reply.isRead);

    if (!hasUnread) {
      return;
    }

    const updatedReplies = allReplies.map((reply) => {
      if (reply.targetUser !== currentStudent) {
        return reply;
      }
      return { ...reply, isRead: true };
    });

    localStorage.setItem("studentReplies", JSON.stringify(updatedReplies));
    setReplies(
      updatedReplies
        .filter((reply) => reply.targetUser === currentStudent)
        .sort((a, b) => (b.id || 0) - (a.id || 0))
    );
  }, [activeMenu, currentStudent]);

  const unreadReplies = replies.filter((reply) => !reply.isRead).length;

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("homeTheme", nextTheme);
    window.dispatchEvent(new CustomEvent("site-theme-change", { detail: nextTheme }));
  };

  const navigateComplaint = (category) => {
    if (!studentUser) return;

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
    if (category === "academics") navigate("/academics");
    if (category === "sports") navigate("/sports-feedback");
    if (category === "hostel") navigate("/hostel-feedback");
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();

    if (!studentUser) return;

    if (passwordForm.current !== studentUser.password) {
      alert("Current password is incorrect.");
      return;
    }

    if (passwordForm.next.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      alert("New password and confirmation do not match.");
      return;
    }

    const registeredUsers = parseJSON("registeredUsers", []);
    const updatedUsers = registeredUsers.map((user) =>
      user.username === studentUser.username ? { ...user, password: passwordForm.next } : user
    );

    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    setStudentUser((prev) => ({ ...prev, password: passwordForm.next }));
    setPasswordForm({ current: "", next: "", confirm: "" });
    alert("Password updated successfully.");
  };

  const logout = () => {
    localStorage.removeItem("currentStudent");
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
            setActiveMenu("dashboard");
            setExpandedMenu(null);
          }}
        >
          Dashboard
        </button>

        <div className="menu-group">
          <button
            className={`sidebar-item ${expandedMenu === "complaints" ? "active" : ""}`}
            onClick={() => setExpandedMenu((prev) => (prev === "complaints" ? null : "complaints"))}
            aria-expanded={expandedMenu === "complaints"}
          >
            <span>Complaints</span>
            <span className="menu-caret">{expandedMenu === "complaints" ? "−" : "+"}</span>
          </button>
          <div className={`submenu-wrap ${expandedMenu === "complaints" ? "open" : "closed"}`}>
            <button className="sidebar-item submenu-item" onClick={() => navigateComplaint("academics")}>Academics</button>
            <button className="sidebar-item submenu-item" onClick={() => navigateComplaint("sports")}>Sports</button>
            <button className="sidebar-item submenu-item" onClick={() => navigateComplaint("hostel")}>Hostel</button>
          </div>
        </div>

        <div className="menu-group">
          <button
            className={`sidebar-item ${expandedMenu === "feedback" ? "active" : ""}`}
            onClick={() => setExpandedMenu((prev) => (prev === "feedback" ? null : "feedback"))}
            aria-expanded={expandedMenu === "feedback"}
          >
            <span>Feedback</span>
            <span className="menu-caret">{expandedMenu === "feedback" ? "−" : "+"}</span>
          </button>
          <div className={`submenu-wrap ${expandedMenu === "feedback" ? "open" : "closed"}`}>
            <button className="sidebar-item submenu-item" onClick={() => navigateFeedback("academics")}>Academics</button>
            <button className="sidebar-item submenu-item" onClick={() => navigateFeedback("sports")}>Sports</button>
            <button className="sidebar-item submenu-item" onClick={() => navigateFeedback("hostel")}>Hostel</button>
          </div>
        </div>

        <button
          className={`sidebar-item ${activeMenu === "responses" ? "active" : ""}`}
          onClick={() => {
            setActiveMenu("responses");
            setExpandedMenu(null);
          }}
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
              Profile
            </button>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <section className="student-content">
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
                {forms.length === 0 ? (
                  <p>No forms available yet.</p>
                ) : (
                  <ul>
                    {forms.slice(0, 5).map((form) => (
                      <li key={form.id}>
                        <span>{form.title}</span>
                        <small>{form.category}</small>
                      </li>
                    ))}
                  </ul>
                )}
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

                  <button type="submit" className="action-btn">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Student;
