import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BTECH_BRANCHES, BTECH_YEARS, getFaculty, getSubjects, initializeAcademicData } from "../utils/academicData";
import { readJSON } from "../utils/storage";
import { STORAGE_KEYS } from "../data/keys";
import { ROLES } from "../auth/roles";

const Academics = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [facultyData, setFacultyData] = useState([]);
  const [year, setYear] = useState("");
  const [dept, setDept] = useState("");
  const [courseId, setCourseId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("homeTheme") || "light");
  const isDark = theme === "dark";

  useEffect(() => {
    initializeAcademicData();
    setSubjects(getSubjects());
    
    // Combine faculty from both default faculty and registered faculty users
    const defaultFacultyList = getFaculty();
    const registeredUsers = readJSON(STORAGE_KEYS.REGISTERED_USERS, []);
    const academicSubjects = getSubjects();
    
    // Convert registered faculty users to faculty object format
    const registeredFaculty = registeredUsers
      .filter((user) => user.role === ROLES.FACULTY)
      .map((user) => {
        // Build teaching array from subjectIds by looking up subject info
        const teaching = (user.subjectIds || []).map((subjectId) => {
          const subject = academicSubjects.find((s) => s.id === subjectId);
          return {
            subjectId,
            year: subject?.year || 2,
            section: 1,
          };
        });
        
        return {
          id: user.id,
          name: user.profile?.fullName || user.username,
          employeeId: user.profile?.employeeId || `FAC-${user.id}`,
          branch: user.profile?.department 
            ? user.profile.department.toUpperCase() 
            : (user.departmentIds?.[0] || "cse").toUpperCase(),
          departmentId: user.departmentIds?.[0] || "cse",
          teaching,
        };
      });
    
    // Combine and deduplicate by faculty ID
    const combined = [...defaultFacultyList];
    registeredFaculty.forEach((regFac) => {
      if (!combined.some((f) => f.id === regFac.id)) {
        combined.push(regFac);
      }
    });
    
    setFacultyData(combined);

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

  const updateDepartments = (y) => {
    setYear(y);
    setDept("");
    setCourseId("");
    setFaculty("");
  };

  const updateBranch = (d) => {
    setDept(d);
    setCourseId("");
    setFaculty("");
  };

  const goToPage = (page) => {
    const selectedSubject = subjects.find((subject) => subject.id === courseId);
    if (!year || !dept || !selectedSubject) {
      alert("Please fill all fields!");
      return;
    }
    navigate(page, {
      state: {
        year: Number(year),
        dept,
        course: selectedSubject.name,
        courseCode: selectedSubject.code,
        subjectId: selectedSubject.id,
        faculty,
      },
    });
  };

  const filteredSubjects = subjects.filter(
    (subject) => Number(subject.year) === Number(year || 0) && subject.branch === dept
  );

  const filteredFaculty = facultyData.filter((item) =>
    item.branch === dept &&
    (item.teaching || []).some(
      (entry) => entry.subjectId === courseId && Number(entry.year) === Number(year || 0)
    )
  );

  // Inline CSS
  const styles = {
    backButton: {
      display: "inline-block",
      marginLeft: "12px",
      marginTop: "12px",
      marginBottom: "15px",
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
      backgroundColor: isDark ? "#171c25" : "#fff",
      padding: "clamp(14px, 4vw, 30px)",
      borderRadius: "12px",
      boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.45)" : "0 8px 20px rgba(0,0,0,0.1)",
      maxWidth: "900px",
      width: "min(900px, calc(100% - 24px))",
      margin: "8px auto 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    heading: { textAlign: "center", color: isDark ? "#f1e4bd" : "#333", marginBottom: "20px" },
    label: { display: "block", marginTop: "10px", color: isDark ? "#d3bc80" : "#555" },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: `1px solid ${isDark ? "#3e3214" : "#ccc"}`,
      backgroundColor: isDark ? "#111722" : "#fff",
      color: isDark ? "#f1e4bd" : "#333",
      marginBottom: "15px",
      boxSizing: "border-box",
    },
    actionButtons: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "20px",
    },
    button: {
      padding: "12px 20px",
      flex: "1 1 220px",
      border: "none",
      borderRadius: "8px",
      backgroundColor: isDark ? "#b8860b" : "#2575fc",
      color: "#fff",
      fontSize: "16px",
      cursor: "pointer",
      transition: "background-color 0.3s, transform 0.2s",
    },
    buttonHover: {
      backgroundColor: "#6a11cb",
      transform: "scale(1.05)",
    },
  };

  return (
    <>
      <button style={styles.backButton} onClick={() => navigate("/student")}>← Back</button>
      <div style={styles.pageCard}>
        <h1 style={styles.heading}>Academics Feedback</h1>

      <label style={styles.label}>Year:</label>
      <select
        style={styles.input}
        value={year}
        onChange={(e) => updateDepartments(e.target.value)}
      >
        <option value="">Select Year</option>
        {BTECH_YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <label style={styles.label}>Department:</label>
      <select
        style={styles.input}
        value={dept}
        onChange={(e) => updateBranch(e.target.value)}
      >
        <option value="">Select Department</option>
        {BTECH_BRANCHES.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <label style={styles.label}>Course:</label>
      <select
        style={styles.input}
        value={courseId}
        onChange={(e) => {
          setCourseId(e.target.value);
          setFaculty("");
        }}
      >
        <option value="">Select Course</option>
        {filteredSubjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name} ({subject.code})
          </option>
        ))}
      </select>

      <label style={styles.label}>Faculty (Choose Your Faculty):</label>
      <select
        style={styles.input}
        value={faculty}
        onChange={(e) => setFaculty(e.target.value)}
      >
        <option value="">Select Faculty</option>
        {filteredFaculty.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name} ({item.employeeId})
          </option>
        ))}
      </select>

      <div style={styles.actionButtons}>
        <button style={styles.button} onClick={() => goToPage("/academics-feedback")}>
          Feedback
        </button>
        <button style={styles.button} onClick={() => goToPage("/academics-complaint")}>
          Raise Complaint
        </button>
      </div>
      </div>
    </>
  );
};

export default Academics;
