import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { NotificationModal } from "../components/NotificationModal";
import { registerUser } from "../api/usersApi";
import { DEPARTMENTS } from "../utils/departments";
import logo from "../assets/logo.svg";
import "../styles/Register.css";

const initialForm = {
  fullName: "",
  studentId: "",
  email: "",
  department: "",
  year: "",
  username: "",
  password: "",
  confirmPassword: "",
};

const validators = {
  fullName: (value) => {
    if (!value.trim()) return "Full name is required.";
    if (value.trim().length < 3) return "Full name must be at least 3 characters.";
    if (!/^[A-Za-z\s.'-]+$/.test(value.trim())) return "Full name contains invalid characters.";
    return "";
  },
  studentId: (value) => {
    if (!value.trim()) return "Student ID is required.";
    if (!/^[A-Za-z0-9-]{4,20}$/.test(value.trim())) return "Student ID must be 4-20 letters/numbers.";
    return "";
  },
  email: (value) => {
    if (!value.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email address.";
    return "";
  },
  department: (value) => (!value ? "Department is required." : ""),
  year: (value) => (!value ? "Year is required." : ""),
  username: (value) => {
    if (!value.trim()) return "Username is required.";
    if (!/^[a-zA-Z0-9._-]{4,20}$/.test(value.trim())) {
      return "Username must be 4-20 chars (letters, numbers, ., _, -).";
    }
    return "";
  },
  password: (value) => {
    if (!value) return "Password is required.";
    if (value.length < 6) return "Password must be at least 6 characters.";
    if (!/[0-9]/.test(value)) return "Password must include at least one number.";
    return "";
  },
  confirmPassword: (value, form) => {
    if (!value) return "Please confirm your password.";
    if (value !== form.password) return "Passwords do not match.";
    return "";
  },
};

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: "", message: "", type: "success" });

  const errors = useMemo(
    () => ({
      fullName: validators.fullName(form.fullName),
      studentId: validators.studentId(form.studentId),
      email: validators.email(form.email),
      department: validators.department(form.department),
      year: validators.year(form.year),
      username: validators.username(form.username),
      password: validators.password(form.password),
      confirmPassword: validators.confirmPassword(form.confirmPassword, form),
    }),
    [form]
  );

  const hasErrors = Object.values(errors).some(Boolean);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlur = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const showFieldError = (key) => touched[key] && errors[key];

  const handleRegister = async (e) => {
    e.preventDefault();
    const allTouched = {
      fullName: true,
      studentId: true,
      email: true,
      department: true,
      year: true,
      username: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    if (hasErrors) {
      showToast("Please fix highlighted fields before submitting.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        role: "student",
        departmentId: form.department,
        departmentIds: [form.department],
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        studentId: form.studentId.trim(),
        year: Number(form.year),
      };

      await registerUser(payload);

      setNotificationData({
        title: "Success!",
        message: "Registration successful! Redirecting to login...",
        type: "success",
      });
      setShowNotification(true);
      setForm(initialForm);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("API FAILED", error);
      showToast(error?.message || "Registration failed!", "error");
    } finally {
      setSubmitting(false);
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
          <form onSubmit={handleRegister} noValidate>
            <label>Full Name:</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              onBlur={() => handleBlur("fullName")}
              placeholder="Enter full name"
              aria-invalid={Boolean(showFieldError("fullName"))}
            />
            {showFieldError("fullName") && <p className="field-error">{errors.fullName}</p>}

            <label>Student ID:</label>
            <input
              type="text"
              value={form.studentId}
              onChange={(e) => updateField("studentId", e.target.value)}
              onBlur={() => handleBlur("studentId")}
              placeholder="Enter student ID"
              aria-invalid={Boolean(showFieldError("studentId"))}
            />
            {showFieldError("studentId") && <p className="field-error">{errors.studentId}</p>}

            <label>Email:</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="Enter email address"
              aria-invalid={Boolean(showFieldError("email"))}
            />
            {showFieldError("email") && <p className="field-error">{errors.email}</p>}

            <label>Department:</label>
            <select
              value={form.department}
              onChange={(e) => updateField("department", e.target.value)}
              onBlur={() => handleBlur("department")}
              aria-invalid={Boolean(showFieldError("department"))}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {showFieldError("department") && <p className="field-error">{errors.department}</p>}

            <label>Year:</label>
            <select
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
              onBlur={() => handleBlur("year")}
              aria-invalid={Boolean(showFieldError("year"))}
            >
              <option value="">Select year</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
            {showFieldError("year") && <p className="field-error">{errors.year}</p>}

            <label>Username:</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
              onBlur={() => handleBlur("username")}
              placeholder="Enter username"
              aria-invalid={Boolean(showFieldError("username"))}
            />
            {showFieldError("username") && <p className="field-error">{errors.username}</p>}

            <label>Password:</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              placeholder="Enter password (min 6 characters)"
              aria-invalid={Boolean(showFieldError("password"))}
            />
            {showFieldError("password") && <p className="field-error">{errors.password}</p>}

            <label>Confirm Password:</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Confirm password"
              aria-invalid={Boolean(showFieldError("confirmPassword"))}
            />
            {showFieldError("confirmPassword") && <p className="field-error">{errors.confirmPassword}</p>}

            <button type="submit" className="register-btn" disabled={submitting || hasErrors}>
              {submitting ? "Registering..." : "Register"}
            </button>
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
