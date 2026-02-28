import React, { useState, useEffect } from "react";
import { safeParse } from "../utils/storage";
import { getCurrentUser } from "../auth/session";
import { getScopedComplaintRows, getScopedFormsForUser, getScopedResponseRowsFromForms } from "../domain/selectors";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalForms: 0,
    totalResponses: 0,
    totalComplaints: 0,
    completionRate: 0,
  });

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    // Get form data
    const forms = safeParse("adminForms", {});
    const formList = getScopedFormsForUser(forms, user);
    const scopedResponses = getScopedResponseRowsFromForms(forms, user);
    const scopedComplaints = getScopedComplaintRows(
      {
        academics: safeParse("academicsComplaints", []),
        sports: safeParse("sportsComplaints", []),
        hostel: safeParse("hostelComplaints", []),
      },
      user
    );
    const complaints = scopedComplaints.filter((item) => item.category === "academics");
    const hostelComplaints = safeParse("hostelComplaints", []);
    const sportsComplaints = safeParse("sportsComplaints", []);

    let formsCount = formList.length;
    const totalResponses = scopedResponses.length;
    const totalComplaints = scopedComplaints.length;

    setStats({
      totalForms: formsCount,
      totalResponses,
      totalComplaints,
      completionRate: formsCount > 0 ? Math.round((totalResponses / (formsCount * 3)) * 100) : 0,
    });

    // Generate notifications
    const notifs = [];

    formList.forEach((form) => {
      const formResponses = scopedResponses.filter((response) => String(response.formId) === String(form.id));
      if (formResponses.length > 0) {
        const latestResponse = formResponses[0];
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

    if (sportsComplaints.length > 0 && user.role === "admin") {
      const latestComplaint = sportsComplaints[sportsComplaints.length - 1];
      notifs.push({
        id: "sports-complaint",
        type: "complaint",
        message: "New sports complaint submitted",
        time: latestComplaint.date,
        category: "sports",
      });
    }

    if (hostelComplaints.length > 0 && user.role === "admin") {
      const latestComplaint = hostelComplaints[hostelComplaints.length - 1];
      notifs.push({
        id: "hostel-complaint",
        type: "complaint",
        message: "New hostel complaint submitted",
        time: latestComplaint.date,
        category: "hostel",
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
        <h2>Welcome to Dashboard</h2>
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
