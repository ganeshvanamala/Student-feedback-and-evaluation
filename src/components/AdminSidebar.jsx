import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { clearSession } from "../auth/session";
import { logoutUser } from "../api/usersApi";

function AdminSidebar({ isOpen, onClose, basePath = "/admin", title = "Admin", menuItems }) {
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedMenu =
    menuItems ||
    [
      { label: "Dashboard", path: `${basePath}/dashboard` },
      { label: "Forms", path: `${basePath}/forms` },
      { label: "Subjects", path: `${basePath}/subjects` },
      { label: "Faculty", path: `${basePath}/faculty` },
      { label: "Users", path: `${basePath}/users` },
      { label: "Responses", path: `${basePath}/responses` },
      { label: "Analysis", path: `${basePath}/analysis` },
    ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("API FAILED", error);
    }
    clearSession();
    navigate("/");
    onClose?.();
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-logo">
        <img src={logo} alt="Logo" />
        <h2>{title}</h2>
        <button className="admin-sidebar-close" onClick={onClose}>
          Menu
        </button>
      </div>

      <nav className="sidebar-menu">
        {resolvedMenu.map((item) => (
          <button
            key={item.path}
            className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
            onClick={() => handleNavigate(item.path)}
          >
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
