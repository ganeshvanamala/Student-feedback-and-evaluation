import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Captcha } from "../components/Captcha";
import logo from "../assets/logo.svg";
import { setSession } from "../auth/session";
import { ROLES } from "../auth/roles";
import { loginUser } from "../api/usersApi";
import { googleLogin as googleLoginApi } from "../api/authApi";
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

  const buildSessionUser = (user, fallbackId = "") => {
    const role = String(user?.role || "").toLowerCase();
    const departmentId = user?.departmentId || user?.departmentIds?.[0] || "";
    return {
      ...user,
      id: user?.id || user?.userId || user?.username || fallbackId,
      username: user?.username || user?.email || fallbackId,
      role,
      departmentId,
      departmentIds: user?.departmentIds || (departmentId ? [departmentId] : []),
      subjectIds: user?.subjectIds || [],
      studentId: user?.studentId || null,
      profile: {
        fullName: user?.profile?.fullName || user?.fullName || "Not provided",
        studentId: user?.profile?.studentId || user?.studentId || "Not provided",
        email: user?.profile?.email || user?.email || "Not provided",
        department:
          user?.profile?.department ||
          getDepartmentNameById(departmentId, departmentId || "Not provided"),
        year: user?.profile?.year || user?.year || "Not provided",
      },
    };
  };

  const navigateByRole = (role) => {
    if (role === ROLES.ADMIN) navigate("/admin");
    else if (role === ROLES.HOD) navigate("/hod");
    else if (role === ROLES.FACULTY) navigate("/faculty");
    else navigate("/student");
  };

  const login = async (type) => {
    if (!captchaVerified) {
      setLoginMessage("Please enter valid CAPTCHA.");
      return;
    }

    try {
      const authResponse = await loginUser({
        username: loginId,
        password: loginPass,
      });

      const user = authResponse?.user || {};
      const token = authResponse?.token || "";
      const expiresAt = authResponse?.expiresAt || null;
      const role = String(user?.role || "").toLowerCase();

      if (!token) {
        setLoginMessage("Login failed. Session token missing.");
        return;
      }

      if (!role || ![ROLES.STUDENT, ROLES.HOD, ROLES.FACULTY, ROLES.ADMIN].includes(role)) {
        setLoginMessage("This account has an invalid role configuration.");
        return;
      }

      if (role !== type) {
        setLoginMessage(`This account is not a ${type.toUpperCase()} account.`);
        return;
      }

      const sessionUser = buildSessionUser(user, loginId);
      setSession(sessionUser, token, expiresAt);
      setLoginMessage("");
      navigateByRole(role);
    } catch (error) {
      console.error("API FAILED", error);
      setLoginMessage(error?.message || "Invalid ID or Password!");
    }
  };

  const onGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse?.credential || "";
      if (!token) {
        setLoginMessage("Google login failed.");
        return;
      }

      const authResponse = await googleLoginApi(token);
      const user = authResponse?.user || {};
      const sessionToken = authResponse?.token || "";
      const expiresAt = authResponse?.expiresAt || null;
      const role = String(user?.role || ROLES.STUDENT).toLowerCase();
      if (!sessionToken) {
        setLoginMessage("Google login failed. Session token missing.");
        return;
      }
      const sessionUser = buildSessionUser(user, user?.username || "");
      setSession(sessionUser, sessionToken, expiresAt);
      if (role === ROLES.STUDENT) {
        setLoginMessage("Google sign-in successful. If any details are missing, complete them in Profile.");
      } else {
        setLoginMessage("");
      }
      navigateByRole(role);
    } catch (error) {
      setLoginMessage(error?.message || "Google login failed.");
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

      {currentView === "home" && (
        <div className="main">
          <div className="center hero-panel">
            <div className="hero-overlay" />
            <div className="hero-content">
              <p className="hero-kicker">Accredited Digital Campus Experience</p>
              <h1>Student Feedback & Evaluation System</h1>
              <p>
                A centralized, secure, and outcomes-focused feedback platform for
                students, faculty, and academic leadership.
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

              <label htmlFor="loginId">Username</label>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter username"
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
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
              <GoogleLogin onSuccess={onGoogleLoginSuccess} onError={() => setLoginMessage("Google login failed.")} />
            </div>
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


