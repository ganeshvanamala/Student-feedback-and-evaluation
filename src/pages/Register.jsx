import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { NotificationModal } from "../components/NotificationModal";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: "", message: "", type: "success" });

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Validation
    if (
      !fullName.trim() ||
      !studentId.trim() ||
      !email.trim() ||
      !department.trim() ||
      !year.trim() ||
      !username.trim() ||
      !password.trim()
    ) {
      showToast("Please fill in all fields!", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address!", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters!", "warning");
      return;
    }

    // Get existing registrations from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    // Check if username already exists
    if (registeredUsers.some(user => user.username === username)) {
      showToast("Username already exists! Please choose another.", "error");
      return;
    }

    // Add new user
    registeredUsers.push({
      username,
      password,
      profile: {
        fullName,
        studentId,
        email,
        department,
        year,
      },
    });
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    setNotificationData({
      title: "Success!",
      message: "Registration successful! Redirecting to login...",
      type: "success"
    });
    setShowNotification(true);
    
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="register-wrapper">
      <NotificationModal 
        isOpen={showNotification}
        title={notificationData.title}
        message={notificationData.message}
        type={notificationData.type}
        onClose={() => setShowNotification(false)}
      />
      {/* Navbar */}
      <nav>
        <div className="logo">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png" alt="Logo" />
          <h2>Student Feedback</h2>
        </div>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="#">Feedback</a></li>
          <li><a href="#">Complaints</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>

      {/* Main Section */}
      <div className="register-main">
        <div className="register-card">
          <h2>Create Account</h2>
          <form onSubmit={handleRegister}>
            <label>Full Name:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
            />

            <label>Student ID:</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID"
            />

            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />

            <label>Department:</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter department"
            />

            <label>Year:</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select year</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>

            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />

            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 6 characters)"
            />

            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />

            <button type="submit" className="register-btn">Register</button>
          </form>

          <p className="login-link">
            Already have an account? <a href="/">Login here</a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer>
        © 2025 Student Feedback & Evaluation System | Designed by Team
      </footer>
    </div>
  );
}

export default Register;
