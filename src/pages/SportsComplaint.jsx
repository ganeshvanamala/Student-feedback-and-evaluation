import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { NotificationModal } from "../components/NotificationModal";

function SportsComplaint() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { name: stateName, id: stateId, sport: stateSport } = location.state || {};
  const [name, setName] = useState(stateName || "");
  const [id, setId] = useState(stateId || "");
  const [sport, setSport] = useState(stateSport || "");
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

  const styles = {
    pageCard: {
      background: isDark ? "rgba(23, 28, 37, 0.95)" : "rgba(255, 248, 240, 0.9)",
      padding: "40px",
      borderRadius: "20px",
      boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
      textAlign: "center",
      width: "450px",
      margin: "50px auto",
      fontFamily: "Arial, sans-serif",
    },
    heading: { marginBottom: "30px", color: isDark ? "#f1e4bd" : "#b01b3b" },
    label: { display: "block", textAlign: "left", marginTop: "15px", marginBottom: "5px", fontWeight: "bold", color: isDark ? "#d3bc80" : "#333" },
    textarea: { width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`, marginBottom: "20px", backgroundColor: isDark ? "#111722" : "#fff", color: isDark ? "#f1e4bd" : "#333" },
    button: { padding: "15px", width: "100%", fontSize: "18px", border: "none", borderRadius: "10px", cursor: "pointer", color: "white", background: isDark ? "linear-gradient(135deg, #b8860b 0%, #8b6b1f 100%)" : "linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)" },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !id.trim() || !sport.trim()) {
      showToast("Please fill all student details!", "warning");
      return;
    }
    if (!complaint.trim()) {
      showToast("Please enter a complaint!", "warning");
      return;
    }
    // check block list
    const blocks = JSON.parse(localStorage.getItem("complaintBlockList")) || { academics: [], sports: [], hostel: [], categoryBlocked: {} };
    if (blocks.categoryBlocked && blocks.categoryBlocked.sports) {
      setNotificationData({
        title: "Access Denied",
        message: "Complaints for Sports have been disabled by an administrator.",
        type: "error"
      });
      setShowNotification(true);
      return;
    }
    if (id && Array.isArray(blocks.sports) && blocks.sports.includes(id)) {
      setNotificationData({
        title: "Access Denied",
        message: "You are blocked from submitting further Sports complaints.",
        type: "error"
      });
      setShowNotification(true);
      return;
    }

    const complaints = JSON.parse(localStorage.getItem("sportsComplaints")) || [];
    complaints.push({
      complaintId: Date.now(),
      name,
      id,
      sport,
      text: complaint,
      date: new Date().toLocaleString(),
      submittedBy: localStorage.getItem("currentStudent") || "unknown",
    });
    localStorage.setItem("sportsComplaints", JSON.stringify(complaints));
    
    setNotificationData({
      title: "Success!",
      message: "Your complaint has been submitted successfully.",
      type: "success"
    });
    setShowNotification(true);
    
    setTimeout(() => {
      navigate("/sports");
    }, 2000);
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
      <h1 style={styles.heading}>Sports Complaint</h1>
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

        <label style={styles.label}>Sport:</label>
        <input
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`, marginBottom: "10px", backgroundColor: isDark ? "#111722" : "#fff", color: isDark ? "#f1e4bd" : "#333" }}
          required
        />

        <label style={styles.label}>Write your complaint:</label>
        <textarea
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Type your complaint here..."
          rows="6"
          style={styles.textarea}
          required
        ></textarea>
        <button type="submit" style={styles.button}>Submit Complaint</button>
      </form>
    </div>
  );
}

export default SportsComplaint;
