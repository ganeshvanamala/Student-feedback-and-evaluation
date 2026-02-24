import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Sports() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [sport, setSport] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("homeTheme") || "light");
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

  const goToPage = (page) => {
    if (!name || !id || !sport) return alert("Fill all fields!");
    navigate(page, { state: { name, id, sport } });
  };

  const styles = {
    backButton: {
      display: "inline-block",
      marginLeft: "30px",
      marginTop: "20px",
      marginBottom: "10px",
      padding: "8px 15px",
      backgroundColor: isDark ? "#2a2f3a" : "#555",
      color: isDark ? "#f1e4bd" : "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      transition: "background-color 0.3s",
    },
    pageCard: {
      background: isDark ? "rgba(23, 28, 37, 0.95)" : "rgba(240, 255, 255, 0.9)",
      padding: "40px",
      borderRadius: "20px",
      boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
      textAlign: "center",
      width: "450px",
      margin: "20px auto",
      fontFamily: "Arial, sans-serif",
    },
    heading: { marginBottom: "30px", color: isDark ? "#f1e4bd" : "#1b3b6f" },
    label: { display: "block", marginTop: "15px", marginBottom: "5px", fontWeight: "bold", textAlign: "left", color: isDark ? "#d3bc80" : "#333" },
    input: { width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`, marginBottom: "15px", boxSizing: "border-box", backgroundColor: isDark ? "#111722" : "#fff", color: isDark ? "#f1e4bd" : "#333" },
    select: { width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`, marginBottom: "15px", boxSizing: "border-box", backgroundColor: isDark ? "#111722" : "#fff", color: isDark ? "#f1e4bd" : "#333" },
    button: {
      padding: "15px",
      width: "100%",
      fontSize: "18px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      color: "white",
      background: isDark
        ? "linear-gradient(135deg, #b8860b 0%, #8b6b1f 100%)"
        : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      marginTop: "10px",
    },
  };

  return (
    <>
      <button style={styles.backButton} onClick={() => navigate("/student")}>← Back</button>
      <div style={styles.pageCard}>
        <h1 style={styles.heading}>Sports Details</h1>

      <label style={styles.label}>Name:</label>
      <input value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />

      <label style={styles.label}>Student ID:</label>
      <input value={id} onChange={(e) => setId(e.target.value)} style={styles.input} required />

      <label style={styles.label}>Select Sport:</label>
      <select value={sport} onChange={(e) => setSport(e.target.value)} style={styles.select} required>
        <option value="">Select Sport</option>
        <option>Football</option>
        <option>Basketball</option>
        <option>Cricket</option>
        <option>Badminton</option>
        <option>Volleyball</option>
      </select>

      <button style={styles.button} onClick={() => goToPage("/sports-feedback")}>Feedback</button>
      <button style={styles.button} onClick={() => goToPage("/sports-complaint")}>Raise Complaint</button>
      </div>
    </>
  );
}

export default Sports;
