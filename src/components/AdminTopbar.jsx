import React from "react";

function AdminTopbar({ onMenuToggle }) {
  const currentTime = new Date().toLocaleTimeString();
  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="admin-topbar">
      <div className="topbar-left">
        <button className="admin-menu-btn" onClick={onMenuToggle}>
          Menu
        </button>
        <h1>Admin Dashboard</h1>
      </div>
      <div className="topbar-right">
        <span className="topbar-datetime">
          {currentDate} | {currentTime}
        </span>
        <div className="topbar-avatar">
          <img src="https://ui-avatars.com/api/?name=Admin&background=2575fc&color=fff" alt="Admin" />
        </div>
      </div>
    </div>
  );
}

export default AdminTopbar;
