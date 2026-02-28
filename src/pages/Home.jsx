import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { Captcha } from "../components/Captcha";
import { safeParse } from "../utils/storage";
import logo from "../assets/logo.svg";
import { setSession } from "../auth/session";
import { ROLES } from "../auth/roles";

function Home() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [loginMessage, setLoginMessage] = useState("");
  const [currentView, setCurrentView] = useState("home"); // 'home', 'about', 'contact'
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("homeTheme") || "light");

  React.useEffect(() => {
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

  const credentials = {
    admin: { id: "admin123", pass: "admin@123" },
  };

  const login = (type) => {
    if (!captchaVerified) {
      setLoginMessage("Please enter valid CAPTCHA.");
      return;
    }

    if (type === "student" || type === "hod" || type === "faculty") {
      // Check registered users for role-based login
      const registeredUsers = safeParse("registeredUsers", []);
      const user = registeredUsers.find(u => u.username === loginId && u.password === loginPass);
      
      if (user) {
        const role = user.role || ROLES.STUDENT;
        const requestedRole = type;
        const isLegacyStudent = requestedRole === "student" && (!user.role || role === ROLES.STUDENT);
        const isExactRoleMatch = role === requestedRole;
        if (!(isLegacyStudent || isExactRoleMatch)) {
          setLoginMessage(`This account is not a ${requestedRole.toUpperCase()} account.`);
          return;
        }

        setSession({
          ...user,
          id: user.id || user.username,
          username: user.username,
          role,
          departmentIds: user.departmentIds || user.departmentId || user.profile?.department || [],
          subjectIds: user.subjectIds || user.subjectId || [],
        });
        setLoginMessage("");
        if (role === ROLES.HOD) {
          navigate("/hod");
        } else if (role === ROLES.FACULTY) {
          navigate("/faculty");
        } else if (role === ROLES.ADMIN) {
          navigate("/admin");
        } else {
          navigate("/student");
        }
      } else {
        setLoginMessage("Invalid ID or Password!");
      }
    } else {
      // Admin login uses hardcoded credentials
      if (loginId === credentials[type].id && loginPass === credentials[type].pass) {
        setSession({
          id: credentials[type].id,
          username: credentials[type].id,
          role: ROLES.ADMIN,
          permissions: ["*"],
        });
        navigate(type === "admin" ? "/admin" : "/student");
      } else {
        setLoginMessage("Invalid ID or Password!");
      }
    }
  };

  return (
    <div className={`page-wrapper theme-${theme}`}>
      {/* Navbar */}
      <nav>
        <div className="logo">
          <img src={logo} alt="Logo" />
          <h2>University Feedback Portal</h2>
        </div>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("about"); }}>About Us</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("contact"); }}>Contact Us</a></li>
        </ul>
      </nav>

      {/* Show About Page */}
      {currentView === "about" && (
        <div className="page-content">
          <button className="back-btn" onClick={() => setCurrentView("home")}>← Back to Home</button>
          <div className="about-card">
            <h1>About Us</h1>
            <p className="intro">
              Welcome to the <strong>Student Feedback & Evaluation System</strong> — a comprehensive platform 
              designed to bridge the gap between students and institutions.
            </p>

            <div className="about-section">
              <h2>Project Overview</h2>
              <p>
                This project is a group project created by <strong>Ganesh Vanamala </strong> and team, aimed at revolutionizing 
                the way student feedback is collected, managed, and analyzed in educational institutions.
              </p>
            </div>

            <div className="about-section">
              <h2>Our Mission</h2>
              <p>
                To provide a transparent, secure, and user-friendly platform where students can voice their opinions 
                and institutions can make data-driven decisions for continuous improvement.
              </p>
            </div>

            <div className="about-section">
              <h2>Key Features</h2>
              <ul>
                <li>✅ Student Registration & Secure Login</li>
                <li>✅ Category-based Feedback (Academics, Sports, Hostel)</li>
                <li>✅ Dynamic Admin Form Builder</li>
                <li>✅ Real-time Response Analytics</li>
                <li>✅ Complaint Management System</li>
                <li>✅ Multi-level Rating Options (Stars, Sliders, Checkboxes)</li>
              </ul>
            </div>

            <div className="about-section">
              <h2>Group Members</h2>
               <p>
                Vanamala Ganesh<br/>
                Sandeep Akkala<br/>
                Jagadeesh Das
              </p>
            </div>

            <div className="about-section">
              <h2>Technology Stack</h2>
              <p>
                <strong>Frontend:</strong> React.js with Vite<br/>
                <strong>Styling:</strong> CSS3 with Responsive Design<br/>
                <strong>Storage:</strong> Browser LocalStorage<br/>
                <strong>Routing:</strong> React Router v6+
              </p>
            </div>

            <div className="about-section">
              <h2>Demo Login Credentials</h2>
              <p>
                Migration V3 demo users are available for testing.<br/>
                <strong>Default password for all demo users:</strong> demo@123
              </p>
              <ul>
                <li><strong>HOD:</strong> hod-cse, hod-ece, hod-eee, hod-mech, hod-civil</li>
                <li><strong>Faculty:</strong> faculty-cse-1, faculty-cse-2, faculty-ece-1, faculty-ece-2, faculty-eee-1, faculty-eee-2, faculty-mech-1, faculty-mech-2, faculty-civil-1, faculty-civil-2</li>
                <li><strong>Students:</strong> Use any migrated student username from Migration V3</li>
                <li><strong>Admin:</strong> admin123 / admin@123</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Show Contact Page */}
      {currentView === "contact" && (
        <div className="page-content">
          <button className="back-btn" onClick={() => setCurrentView("home")}>← Back to Home</button>
          <div className="contact-card">
            <h1>Contact Us</h1>
            <p className="intro">
              Have questions or feedback about our platform? We'd love to hear from you!
            </p>

            <div className="contact-section">
              <h2>Get in Touch</h2>
              <div className="contact-info">
                <div className="contact-item">
                  <strong>📧 Email:</strong>
                  <p><a href="mailto:feedback@studentfeedback.com">feedback@studentfeedback.com</a></p>
                </div>
                <div className="contact-item">
                  <strong>📱 Phone:</strong>
                  <p>+91-XXXX-XXXX-XX</p>
                </div>
                <div className="contact-item">
                  <strong>🏢 Address:</strong>
                  <p>Educational Institute Campus<br/>City, State - 123456<br/>India</p>
                </div>
                <div className="contact-item">
                  <strong>⏰ Working Hours:</strong>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM<br/>Saturday: 10:00 AM - 4:00 PM<br/>Sunday: Closed</p>
                </div>
              </div>
            </div>

            <div className="contact-section">
              <h2>Social Media</h2>
              <div className="social-links">
                <a href="#" className="social-btn">Facebook</a>
                <a href="#" className="social-btn">Twitter</a>
                <a href="#" className="social-btn">LinkedIn</a>
                <a href="#" className="social-btn">Instagram</a>
              </div>
            </div>

            <div className="contact-section">
              <h2>Group Members</h2>
              <p>
                Vanamala Ganesh<br/>
                Sandeep Akkala<br/>
                Jagadeesh Das
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show Home Page */}
      {currentView === "home" && (
        <div className="main">
          <div className="center hero-panel">
            <div className="hero-overlay" />
            <div className="hero-content">
              <p className="hero-kicker">Accredited Digital Campus Experience</p>
              <h1>Student Feedback & Evaluation System</h1>
              <p>
                Centralized, secure, and actionable feedback workflows for students,
                faculty, and academic leadership.
                <br /><br />
                Empowering students | Supporting faculty | Enhancing outcomes
              </p>
            </div>
          </div>

        <div className="right">
          <div className="login-card">
            <h2>University Portal Login</h2>

            <div className="form-stack">
              <label htmlFor="roleSelect">Role</label>
              <select
                id="roleSelect"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="role-select"
              >
                <option value="student">Student</option>
                <option value="hod">HOD</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>

              <label htmlFor="loginId">ID</label>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter ID"
              />

              <label htmlFor="loginPass">Password</label>
              <input
                id="loginPass"
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Enter Password"
              />

              <div className="captcha-row">
                <Captcha onVerify={setCaptchaVerified} theme={theme} />
              </div>
            </div>

            <button onClick={() => login(selectedRole)} className="login-btn">
              Login as {selectedRole.toUpperCase()}
            </button>
            <p id="loginMessage">{loginMessage}</p>
            <button onClick={() => navigate("/register")} className="register-btn">Register</button>
          </div>
        </div>
      </div>
      )}
      <footer>
        © 2025 Student Feedback & Evaluation System | Designed by Team
      </footer>
    </div>
  );
}

export default Home;
