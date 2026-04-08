import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { NotificationModal } from "../components/NotificationModal";
import { registerUser } from "../api/usersApi";
import { DEPARTMENTS } from "../utils/departments";
import logo from "../assets/logo.svg";
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

  const handleRegister = async (e) => {
    e.preventDefault();

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

    try {
      const payload = {
        username: username.trim(),
        password,
        role: "student",
        departmentId: department,
        departmentIds: [department],
        fullName: fullName.trim(),
        email: email.trim(),
        studentId: studentId.trim(),
        year: Number(year),
      };

      await registerUser(payload);

      setNotificationData({
        title: "Success!",
        message: "Registration successful! Redirecting to login...",
        type: "success",
      });
      setShowNotification(true);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("API FAILED", error);
      showToast("Registration failed!", "error");
    }
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
      <nav>
        <div className="logo">
          <img src={logo} alt="Logo" />
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
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

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

      <footer>
        © 2025 Student Feedback & Evaluation System | Designed by Team
      </footer>
    </div>
  );
}

export default Register;
