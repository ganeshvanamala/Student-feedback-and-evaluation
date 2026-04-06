import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { NotificationModal } from "../components/NotificationModal";
import { getCurrentUser } from "../auth/session";
import { createComplaint } from "../api/complaintsApi";
import { fetchComplaintBlockList } from "../api/complaintBlockApi";
import { getUsers } from "../api/usersApi";
import { inferDepartmentId } from "../utils/departments";

function HostelComplaint() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { name: stateName, id: stateId, hostel: stateHostel } = location.state || {};
  const currentUser = getCurrentUser();

  const [name, setName] = useState(stateName || "");
  const [id, setId] = useState(stateId || "");
  const [hostel, setHostel] = useState(stateHostel || "");
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
    () => inferDepartmentId(currentUser.departmentId || currentUser.departmentIds?.[0] || ""),
    [currentUser.departmentId, currentUser.departmentIds]
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
        }
      } catch (error) {
        console.error("API FAILED", error);
      }
    };

    loadRecipients();
  }, [departmentId]);

  const styles = {
    pageCard: {
      background: isDark ? "rgba(23, 28, 37, 0.95)" : "rgba(255, 248, 240, 0.9)",
      padding: "clamp(16px, 5vw, 40px)",
      borderRadius: "20px",
      boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
      textAlign: "center",
      width: "min(450px, calc(100% - 24px))",
      margin: "12px auto",
      fontFamily: "Arial, sans-serif",
    },
    heading: {
      marginBottom: "30px",
      color: isDark ? "#f1e4bd" : "#b01b3b",
      textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
    },
    label: {
      display: "block",
      textAlign: "left",
      marginTop: "15px",
      marginBottom: "5px",
      fontWeight: "bold",
      color: isDark ? "#d3bc80" : "#333",
    },
    textarea: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`,
      backgroundColor: isDark ? "#111722" : "#fff",
      color: isDark ? "#f1e4bd" : "#333",
      marginBottom: "20px",
      boxSizing: "border-box",
    },
    button: {
      display: "block",
      width: "100%",
      padding: "15px",
      fontSize: "18px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      color: "white",
      background: isDark
        ? "linear-gradient(135deg, #b8860b 0%, #8b6b1f 100%)"
        : "linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)",
      transition: "transform 0.2s, background 0.3s",
    },
  };

  const handleHover = (e, hover) => {
    e.target.style.transform = hover ? "scale(1.05)" : "scale(1)";
    e.target.style.background = hover
      ? (isDark
          ? "linear-gradient(135deg, #d4af37 0%, #8b6b1f 100%)"
          : "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)")
      : (isDark
          ? "linear-gradient(135deg, #b8860b 0%, #8b6b1f 100%)"
          : "linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !id.trim() || !hostel.trim()) {
      showToast("Please fill all student details!", "warning");
      return;
    }
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
      if (blocks.categoryBlocked && blocks.categoryBlocked.hostel) {
        setNotificationData({
          title: "Access Denied",
          message: "Complaints for Hostel have been disabled by an administrator.",
          type: "error"
        });
        setShowNotification(true);
        return;
      }
      if (id && Array.isArray(blocks.hostel) && blocks.hostel.includes(id)) {
        setNotificationData({
          title: "Access Denied",
          message: "You are blocked from submitting further Hostel complaints.",
          type: "error"
        });
        setShowNotification(true);
        return;
      }

      await createComplaint({
        complaintId: Date.now(),
        category: "hostel",
        name,
        studentId: id,
        hostel,
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
        navigate("/hostel");
      }, 2000);
    } catch (error) {
      console.error("API FAILED", error);
      showToast("Unable to submit complaint", "error");
    }
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
      <h1 style={styles.heading}>Hostel Complaint</h1>
      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Name:</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`, marginBottom: "10px", backgroundColor: isDark ? "#111722" : "#fff", color: isDark ? "#f1e4bd" : "#333" }}
          required
        />

        <label style={styles.label}>Student ID:</label>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`, marginBottom: "10px", backgroundColor: isDark ? "#111722" : "#fff", color: isDark ? "#f1e4bd" : "#333" }}
          required
        />

        <label style={styles.label}>Hostel:</label>
        <input
          value={hostel}
          onChange={(e) => setHostel(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`, marginBottom: "10px", backgroundColor: isDark ? "#111722" : "#fff", color: isDark ? "#f1e4bd" : "#333" }}
          required
        />

        <label style={styles.label}>Send To:</label>
        <select
          value={recipientType}
          onChange={(e) => setRecipientType(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`, marginBottom: "10px", backgroundColor: isDark ? "#111722" : "#fff", color: isDark ? "#f1e4bd" : "#333" }}
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
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`, marginBottom: "10px", backgroundColor: isDark ? "#111722" : "#fff", color: isDark ? "#f1e4bd" : "#333" }}
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
              onChange={(e) => setTargetFacultyUsername(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`, marginBottom: "10px", backgroundColor: isDark ? "#111722" : "#fff", color: isDark ? "#f1e4bd" : "#333" }}
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
          rows="6"
          style={styles.textarea}
          required
        ></textarea>
        <button
          type="submit"
          style={styles.button}
          onMouseEnter={(e) => handleHover(e, true)}
          onMouseLeave={(e) => handleHover(e, false)}
        >
          Submit Complaint
        </button>
      </form>
    </div>
  );
}

export default HostelComplaint;