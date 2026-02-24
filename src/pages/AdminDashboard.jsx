import React, { useState, useEffect } from "react";

const flattenForms = (rawForms) =>
  Object.entries(rawForms || {}).flatMap(([categoryId, value]) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((form) => ({ ...form, __categoryId: categoryId }));
    return [{ ...value, __categoryId: categoryId }];
  });

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalForms: 0,
    totalResponses: 0,
    totalComplaints: 0,
    completionRate: 0,
  });

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Get form data
    const forms = JSON.parse(localStorage.getItem("adminForms")) || {};
    const formList = flattenForms(forms);
    const complaints = JSON.parse(localStorage.getItem("academicsComplaints")) || [];
    const hostelComplaints = JSON.parse(localStorage.getItem("hostelComplaints")) || [];
    const sportsComplaints = JSON.parse(localStorage.getItem("sportsComplaints")) || [];

    let formsCount = formList.length;
    let totalResponses = 0;

    formList.forEach((form) => {
      totalResponses += form.responses?.length || 0;
    });

    const totalComplaints = complaints.length + hostelComplaints.length + sportsComplaints.length;

    setStats({
      totalForms: formsCount,
      totalResponses,
      totalComplaints,
      completionRate: formsCount > 0 ? Math.round((totalResponses / (formsCount * 3)) * 100) : 0,
    });

    // Generate notifications
    const notifs = [];

    formList.forEach((form) => {
      if (form.responses && form.responses.length > 0) {
        const latestResponse = form.responses[form.responses.length - 1];
        notifs.push({
          id: `${form.__categoryId}-${form.id}`,
          type: "form-response",
          message: `New ${form.__categoryId} form response received`,
          time: latestResponse.timestamp,
          category: form.__categoryId,
        });
      }
    });

    if (complaints.length > 0) {
      const latestComplaint = complaints[complaints.length - 1];
      notifs.push({
        id: "academics-complaint",
        type: "complaint",
        message: "New academics complaint submitted",
        time: latestComplaint.date,
        category: "academics",
      });
    }

    setNotifications(notifs.slice(0, 5));
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: color + "20" }}>
        {icon}
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );

  const NotificationItem = ({ notif }) => (
    <div className="notification-item">
      <span className="notif-icon">
        {notif.type === "form-response" ? "📋" : "⚠️"}
      </span>
      <div className="notif-content">
        <p>{notif.message}</p>
        <span className="notif-time">{notif.time}</span>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to Admin Dashboard</h2>
        <p>Overview of your feedback management system</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Forms"
          value={stats.totalForms}
          icon="📋"
          color="#2575fc"
        />
        <StatCard
          title="Total Responses"
          value={stats.totalResponses}
          icon="✉️"
          color="#4CAF50"
        />
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          icon="⚠️"
          color="#FF9800"
        />
        <StatCard
          title="Response Rate"
          value={`${stats.completionRate}%`}
          icon="📈"
          color="#E91E63"
        />
      </div>

      <div className="dashboard-section">
        <h3>Recent Activity & Notifications</h3>
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <p>✨ All quiet! No new notifications</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => (
              <NotificationItem key={notif.id} notif={notif} />
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h3>Quick Stats</h3>
        <div className="quick-stats">
          <div className="quick-stat-item">
            <span className="quick-stat-label">Forms Created</span>
            <span className="quick-stat-value">{stats.totalForms}</span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Responses Received</span>
            <span className="quick-stat-value">{stats.totalResponses}</span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Complaints Filed</span>
            <span className="quick-stat-value">{stats.totalComplaints}</span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Engagement Rate</span>
            <span className="quick-stat-value">{stats.completionRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
