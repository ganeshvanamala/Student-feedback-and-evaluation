import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { NotificationModal } from "../components/NotificationModal";

function AcademicsComplaint() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { faculty: stateFaculty, year, dept, course, courseCode, subjectId } = location.state || {};
  const [faculty, setFaculty] = useState(stateFaculty || "");
  const [complaint, setComplaint] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("homeTheme") || "light");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: "", message: "", type: "success" });
  const isDark = theme === "dark";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!faculty.trim()) {
      showToast("Please enter faculty name!", "warning");
      return;
    }
    if (!complaint.trim()) {
      showToast("Please enter a complaint!", "warning");
      return;
    }
    // check whether this category is blocked for complaints
    const blocks = JSON.parse(localStorage.getItem("complaintBlockList")) || { academics: [], sports: [], hostel: [], categoryBlocked: {} };
    if (blocks.categoryBlocked && blocks.categoryBlocked.academics) {
      setNotificationData({
        title: "Access Denied",
        message: "Complaints for Academics have been disabled by an administrator.",
        type: "error"
      });
      setShowNotification(true);
      return;
    }
    const complaints = JSON.parse(localStorage.getItem("academicsComplaints")) || [];
    complaints.push({
      complaintId: Date.now(),
      faculty,
      year,
      dept,
      course,
      courseCode,
      subjectId,
      text: complaint,
      date: new Date().toLocaleString(),
      submittedBy: localStorage.getItem("currentStudent") || "unknown",
    });
    localStorage.setItem("academicsComplaints", JSON.stringify(complaints));
    
    setNotificationData({
      title: "Success!",
      message: "Your complaint has been submitted successfully.",
      type: "success"
    });
    setShowNotification(true);
    
    setTimeout(() => {
      navigate("/academics");
    }, 2000);
  };

  // Inline CSS
  const styles = {
    pageCard: {
      backgroundColor: isDark ? "#171c25" : "#fff",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: isDark ? "0 0 16px rgba(0,0,0,0.45)" : "0 0 10px rgba(0,0,0,0.1)",
      maxWidth: "600px",
      margin: "20px auto",
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
        <label style={styles.label}>Faculty:</label>
        <input
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
          placeholder="Enter faculty name"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`,
            backgroundColor: isDark ? "#111722" : "#fff",
            color: isDark ? "#f1e4bd" : "#333",
            marginTop: "5px",
            marginBottom: "16px",
          }}
          required
        />
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
