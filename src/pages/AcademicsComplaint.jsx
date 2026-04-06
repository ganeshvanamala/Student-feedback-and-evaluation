import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { NotificationModal } from "../components/NotificationModal";
import { getCurrentUser } from "../auth/session";
import { createComplaint } from "../api/complaintsApi";
import { fetchComplaintBlockList } from "../api/complaintBlockApi";
import { getUsers } from "../api/usersApi";
import { inferDepartmentId } from "../utils/departments";

function AcademicsComplaint() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { faculty: stateFaculty, year, dept, course, courseCode, subjectId } = location.state || {};
  const currentUser = getCurrentUser();

  const [faculty, setFaculty] = useState(stateFaculty || "");
  const [complaint, setComplaint] = useState("");
  const [recipientType, setRecipientType] = useState("hod");
  const [targetHodUsername, setTargetHodUsername] = useState("");
  const [targetFacultyUsername, setTargetFacultyUsername] = useState("");
  const [hodOptions, setHodOptions] = useState([]);
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem("homeTheme") || "light");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: "", message: "", type: "success" });
  const isDark = theme === "dark";

  const departmentId = useMemo(
    () => inferDepartmentId(dept || currentUser.departmentId || currentUser.departmentIds?.[0] || ""),
    [dept, currentUser.departmentId, currentUser.departmentIds]
  );

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
    const loadRecipients = async () => {
      try {
        const users = await getUsers();
        const inDepartment = users.filter((user) => {
          const userDepartment = inferDepartmentId(user.departmentId || user.departmentIds?.[0] || "");
          return !departmentId || userDepartment === departmentId;
        });

        const hods = inDepartment.filter((user) => String(user.role || "").toLowerCase() === "hod");
        const faculties = inDepartment.filter((user) => String(user.role || "").toLowerCase() === "faculty");

        setHodOptions(hods);
        setFacultyOptions(faculties);

        if (hods.length > 0) {
          setTargetHodUsername((prev) => prev || hods[0].username || "");
        }

        if (faculties.length > 0) {
          setTargetFacultyUsername((prev) => prev || faculties[0].username || "");
          if (!faculty) {
            setFaculty(faculties[0].fullName || faculties[0].username || "");
          }
        }
      } catch (error) {
        console.error("API FAILED", error);
      }
    };

    loadRecipients();
  }, [departmentId, faculty]);

  const syncFacultyName = (username) => {
    const selected = facultyOptions.find((item) => item.username === username);
    if (selected) {
      setFaculty(selected.fullName || selected.username || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!complaint.trim()) {
      showToast("Please enter a complaint!", "warning");
      return;
    }

    if ((recipientType === "faculty" || recipientType === "both") && !targetFacultyUsername) {
      showToast("Please select faculty recipient!", "warning");
      return;
    }

    if ((recipientType === "hod" || recipientType === "both") && !targetHodUsername) {
      showToast("Please select HOD recipient!", "warning");
      return;
    }

    try {
      const blocks = await fetchComplaintBlockList();
      if (blocks.categoryBlocked && blocks.categoryBlocked.academics) {
        setNotificationData({
          title: "Access Denied",
          message: "Complaints for Academics have been disabled by an administrator.",
          type: "error"
        });
        setShowNotification(true);
        return;
      }

      await createComplaint({
        complaintId: Date.now(),
        category: "academics",
        faculty,
        year,
        dept,
        course,
        courseCode,
        subjectId,
        text: complaint,
        date: new Date().toLocaleString(),
        submittedBy: currentUser.username || "unknown",
        plagged: false,
        recipientType,
        targetDepartmentId: departmentId,
        targetHodUsername: recipientType === "faculty" ? "" : targetHodUsername,
        targetFacultyUsername: recipientType === "hod" ? "" : targetFacultyUsername,
      });

      setNotificationData({
        title: "Success!",
        message: "Your complaint has been submitted successfully.",
        type: "success"
      });
      setShowNotification(true);

      setTimeout(() => {
        navigate("/academics");
      }, 2000);
    } catch (error) {
      console.error("API FAILED", error);
      showToast("Unable to submit complaint", "error");
    }
  };

  const styles = {
    pageCard: {
      backgroundColor: isDark ? "#171c25" : "#fff",
      padding: "clamp(14px, 4vw, 20px)",
      borderRadius: "8px",
      boxShadow: isDark ? "0 0 16px rgba(0,0,0,0.45)" : "0 0 10px rgba(0,0,0,0.1)",
      maxWidth: "600px",
      width: "min(600px, calc(100% - 24px))",
      margin: "12px auto",
      fontFamily: "Arial, sans-serif",
    },
    heading: {
      margin: "0 0 20px 0",
      textAlign: "center",
      color: isDark ? "#f1e4bd" : "#333",
    },
    label: {
      display: "block",
      marginTop: "15px",
      fontWeight: "bold",
      color: isDark ? "#d3bc80" : "#333",
    },
    textarea: {
      width: "100%",
      padding: "6px",
      marginTop: "5px",
      borderRadius: "4px",
      border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`,
      backgroundColor: isDark ? "#111722" : "#fff",
      color: isDark ? "#f1e4bd" : "#333",
      resize: "vertical",
    },
    button: {
      marginTop: "20px",
      padding: "10px 20px",
      backgroundColor: isDark ? "#b8860b" : "#4CAF50",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
    },
  };

  return (
    <div style={styles.pageCard}>
      <NotificationModal
        isOpen={showNotification}
        title={notificationData.title}
        message={notificationData.message}
        type={notificationData.type}
        onClose={() => setShowNotification(false)}
      />
      <h1 style={styles.heading}>Academics Complaint</h1>
      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Send To:</label>
        <select
          value={recipientType}
          onChange={(e) => setRecipientType(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`,
            backgroundColor: isDark ? "#111722" : "#fff",
            color: isDark ? "#f1e4bd" : "#333",
            marginTop: "5px",
          }}
        >
          <option value="hod">HOD</option>
          <option value="faculty">Faculty</option>
          <option value="both">Both</option>
        </select>

        {(recipientType === "hod" || recipientType === "both") && (
          <>
            <label style={styles.label}>HOD Recipient:</label>
            <select
              value={targetHodUsername}
              onChange={(e) => setTargetHodUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`,
                backgroundColor: isDark ? "#111722" : "#fff",
                color: isDark ? "#f1e4bd" : "#333",
                marginTop: "5px",
              }}
              required={recipientType === "hod" || recipientType === "both"}
            >
              <option value="">Select HOD</option>
              {hodOptions.map((hod) => (
                <option key={hod.id || hod.username} value={hod.username}>
                  {hod.fullName || hod.username}
                </option>
              ))}
            </select>
          </>
        )}

        {(recipientType === "faculty" || recipientType === "both") && (
          <>
            <label style={styles.label}>Faculty Recipient:</label>
            <select
              value={targetFacultyUsername}
              onChange={(e) => {
                setTargetFacultyUsername(e.target.value);
                syncFacultyName(e.target.value);
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`,
                backgroundColor: isDark ? "#111722" : "#fff",
                color: isDark ? "#f1e4bd" : "#333",
                marginTop: "5px",
              }}
              required={recipientType === "faculty" || recipientType === "both"}
            >
              <option value="">Select Faculty</option>
              {facultyOptions.map((item) => (
                <option key={item.id || item.username} value={item.username}>
                  {item.fullName || item.username}
                </option>
              ))}
            </select>
          </>
        )}

        <label style={styles.label}>Write your complaint:</label>
        <textarea
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Type your complaint here..."
          required
          style={styles.textarea}
          rows={6}
        ></textarea>
        <button type="submit" style={styles.button}>Submit Complaint</button>
      </form>
    </div>
  );
}

export default AcademicsComplaint;