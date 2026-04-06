import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { Captcha } from "../components/Captcha";
import logo from "../assets/logo.svg";
import { setSession } from "../auth/session";
import { ROLES } from "../auth/roles";
import { loginUser } from "../api/usersApi";
import { getDepartmentNameById } from "../utils/departments";

function Home() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [loginMessage, setLoginMessage] = useState("");
  const [currentView, setCurrentView] = useState("home");
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

  const login = async (type) => {
    if (!captchaVerified) {
      setLoginMessage("Please enter valid CAPTCHA.");
      return;
    }

    if (type === "student" || type === "hod" || type === "faculty") {
      try {
        const loginData = {
          username: loginId,
          password: loginPass,
        };

        const user = await loginUser(loginData);
        const role = String(user?.role || "").toLowerCase();

        if (!role || ![ROLES.STUDENT, ROLES.HOD, ROLES.FACULTY, ROLES.ADMIN].includes(role)) {
          setLoginMessage("This account has an invalid role configuration.");
          return;
        }

        if (role !== type) {
          setLoginMessage(`This account is not a ${type.toUpperCase()} account.`);
          return;
        }

        const departmentId = user?.departmentId || user?.departmentIds?.[0] || "";

        const sessionUser = {
          ...user,
          id: user?.id || user?.userId || user?.username || loginId,
          username: user?.username || loginId,
          role,
          departmentId,
          departmentIds: user?.departmentIds || (departmentId ? [departmentId] : []),
          subjectIds: user?.subjectIds || [],
          studentId: user?.studentId || user?.profile?.studentId || null,
          profile: {
            fullName: user?.profile?.fullName || user?.fullName || "Not provided",
            studentId: user?.profile?.studentId || user?.studentId || "Not provided",
            email: user?.profile?.email || user?.email || "Not provided",
            department:
              user?.profile?.department ||
              getDepartmentNameById(departmentId, departmentId || "Not provided"),
            year: user?.profile?.year || user?.year || "Not provided",
          },
          password: loginPass,
        };

        setSession(sessionUser);
        setLoginMessage("");

        if (role === ROLES.HOD) {
          navigate("/hod");
        } else if (role === ROLES.FACULTY) {
          navigate("/faculty");
        } else {
          navigate("/student");
        }
      } catch (error) {
        console.error("API FAILED", error);
        setLoginMessage("Invalid ID or Password!");
      }
    } else {
      if (loginId === credentials[type].id && loginPass === credentials[type].pass) {
        setSession({
          id: credentials[type].id,
          username: credentials[type].id,
          role: ROLES.ADMIN,
          permissions: ["*"],
          password: loginPass,
        });
        navigate("/admin");
      } else {
        setLoginMessage("Invalid ID or Password!");
      }
    }
  };

  return (
    <div className={`page-wrapper theme-${theme}`}>
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

      {currentView === "about" && (
        <div className="page-content">
          <button className="back-btn" onClick={() => setCurrentView("home")}>â† Back to Home</button>
          <div className="about-card">
            <h1>About Us</h1>
            <p className="intro">
              Welcome to the <strong>Student Feedback & Evaluation System</strong> â€” a comprehensive platform
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
                <li>âœ… Student Registration & Secure Login</li>
                <li>âœ… Category-based Feedback (Academics, Sports, Hostel)</li>
                <li>âœ… Dynamic Admin Form Builder</li>
                <li>âœ… Real-time Response Analytics</li>
                <li>âœ… Complaint Management System</li>
                <li>âœ… Multi-level Rating Options (Stars, Sliders, Checkboxes)</li>
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
          </div>
        </div>
      )}

      {currentView === "contact" && (
        <div className="page-content">
          <button className="back-btn" onClick={() => setCurrentView("home")}>â† Back to Home</button>
          <div className="contact-card">
            <h1>Contact Us</h1>
            <p className="intro">
              Have questions or feedback about our platform? We'd love to hear from you!
            </p>

            <div className="contact-section">
              <h2>Get in Touch</h2>
              <div className="contact-info">
                <div className="contact-item">
                  <strong>ðŸ“§ Email:</strong>
                  <p><a href="mailto:feedback@studentfeedback.com">feedback@studentfeedback.com</a></p>
                </div>
                <div className="contact-item">
                  <strong>ðŸ“± Phone:</strong>
                  <p>+91-XXXX-XXXX-XX</p>
                </div>
                <div className="contact-item">
                  <strong>ðŸ¢ Address:</strong>
                  <p>Educational Institute Campus<br/>City, State - 123456<br/>India</p>
                </div>
                <div className="contact-item">
                  <strong>â° Working Hours:</strong>
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
        Â© 2025 Student Feedback & Evaluation System | Designed by Team
      </footer>
    </div>
  );
}

export default Home;

