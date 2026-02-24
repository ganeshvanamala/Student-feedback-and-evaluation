import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Hostel() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [hostel, setHostel] = useState("");
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
    if (!name || !id || !hostel) return alert("Fill all fields!");
    navigate(page, { state: { name, id, hostel } });
  };

  // Inline styles like Student.jsx / Academics
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
      background: isDark ? "rgba(23, 28, 37, 0.95)" : "rgba(240, 248, 255, 0.85)",
      padding: "40px",
      borderRadius: "20px",
      boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
      textAlign: "center",
      width: "400px",
      margin: "20px auto",
      fontFamily: "Arial, sans-serif",
    },
    heading: {
      marginBottom: "30px",
      color: isDark ? "#f1e4bd" : "#1b3b6f",
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
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`,
      backgroundColor: isDark ? "#111722" : "#fff",
      color: isDark ? "#f1e4bd" : "#333",
      marginBottom: "15px",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`,
      backgroundColor: isDark ? "#111722" : "#fff",
      color: isDark ? "#f1e4bd" : "#333",
      marginBottom: "15px",
      boxSizing: "border-box",
    },
    button: {
      display: "block",
      width: "100%",
      padding: "15px",
      margin: "12px 0",
      fontSize: "18px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      color: "white",
      background: isDark
        ? "linear-gradient(135deg, #b8860b 0%, #8b6b1f 100%)"
        : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      transition: "transform 0.2s, background 0.3s",
    },
    logoutButton: {
      display: "block",
      width: "100%",
      padding: "15px",
      marginTop: "20px",
      fontSize: "18px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      color: "white",
      background: "#f44336",
      transition: "transform 0.2s, background 0.3s",
    },
  };

  const handleHover = (e, hover) => {
    e.target.style.transform = hover ? "scale(1.05)" : "scale(1)";
    e.target.style.background = hover
      ? (isDark
          ? "linear-gradient(135deg, #d4af37 0%, #8b6b1f 100%)"
          : "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)")
      : (isDark
          ? "linear-gradient(135deg, #b8860b 0%, #8b6b1f 100%)"
          : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)");
  };

  return (
    <>
      <button style={styles.backButton} onClick={() => navigate("/student")}>← Back</button>
      <div style={styles.pageCard}>
        <h1 style={styles.heading}>Hostel Details</h1>

      <label style={styles.label}>Name:</label>
      <input
        style={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <label style={styles.label}>Student ID:</label>
      <input
        style={styles.input}
        value={id}
        onChange={(e) => setId(e.target.value)}
        required
      />

      <label style={styles.label}>Select Hostel:</label>
      <select
        style={styles.select}
        value={hostel}
        onChange={(e) => setHostel(e.target.value)}
        required
      >
        <option value="">Select Hostel</option>
        <option>Hostel A</option>
        <option>Hostel B</option>
        <option>Hostel C</option>
        <option>Hostel D</option>
      </select>

      <button
        style={styles.button}
        onMouseEnter={(e) => handleHover(e, true)}
        onMouseLeave={(e) => handleHover(e, false)}
        onClick={() => goToPage("/hostel-feedback")}
      >
        Feedback
      </button>

      <button
        style={styles.button}
        onMouseEnter={(e) => handleHover(e, true)}
        onMouseLeave={(e) => handleHover(e, false)}
        onClick={() => goToPage("/hostel-complaint")}
      >
        Raise Complaint
      </button>

      <button
        style={styles.logoutButton}
        onClick={() => navigate("/")}
        onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
      >
        Logout
      </button>
      </div>
    </>
  );
}

export default Hostel;
