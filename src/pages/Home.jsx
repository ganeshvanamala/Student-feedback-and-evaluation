import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { Captcha } from "../components/Captcha";
import { safeParse } from "../utils/storage";
import logo from "../assets/logo.svg";

function Home() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
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
    student: { id: "student123", pass: "student@123" },
  };

  const login = (type) => {
    if (!captchaVerified) {
      setLoginMessage("Please enter valid CAPTCHA.");
      return;
    }

    if (type === "student") {
      // Check registered users for student login
      const registeredUsers = safeParse("registeredUsers", []);
      const user = registeredUsers.find(u => u.username === loginId && u.password === loginPass);
      
      if (user) {
        localStorage.setItem("currentStudent", user.username);
        setLoginMessage("");
        navigate("/student");
      } else {
        setLoginMessage("Invalid ID or Password!");
      }
    } else {
      // Admin login uses hardcoded credentials
      if (loginId === credentials[type].id && loginPass === credentials[type].pass) {
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
          <h2>Student Feedback</h2>
        </div>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("about"); }}>AboutUs</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("contact"); }}>ContactUs</a></li>
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
          <div className="center">
            <h1>Student Feedback & Evaluation System 🎓</h1>
            <p>
              A transparent and efficient platform for students to share their feedback,
              and for institutions to gain valuable insights for continuous improvement.
              <br /><br />
              Empowering students ✨ | Supporting faculty 📘 | Enhancing academics 📊
            </p>
          </div>

        <div className="right">
          <div className="login-card">
            <h2>Login</h2>
            <label>ID:</label>
            <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="Enter ID" />
            <label>Password:</label>
            <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Enter Password" />
            <Captcha onVerify={setCaptchaVerified} theme={theme} />
            
            <button onClick={() => login("student")} className="login-btn">Student Login</button>
            <button onClick={() => login("admin")} className="login-btn">Admin Login</button>
            <p id="loginMessage" style={{ color: "red" }}>{loginMessage}</p>
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
