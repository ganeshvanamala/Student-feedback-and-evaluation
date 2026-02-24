import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Forms", path: "/admin/forms" },
    { label: "Subjects", path: "/admin/subjects" },
    { label: "Faculty", path: "/admin/faculty" },
    { label: "Responses", path: "/admin/responses" },
    { label: "Analysis", path: "/admin/analysis" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
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
        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png" alt="Logo" />
        <h2>Admin</h2>
        <button className="admin-sidebar-close" onClick={onClose}>
          Menu
        </button>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
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
