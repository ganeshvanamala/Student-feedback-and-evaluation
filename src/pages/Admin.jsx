import React, { useState } from "react";

function Admin() {
  const [tab, setTab] = useState("academics");

  const academicsFeedbacks = JSON.parse(localStorage.getItem("academicsFeedbacks")) || [];
  const academicsComplaints = JSON.parse(localStorage.getItem("academicsComplaints")) || [];
  const hostelFeedbacks = JSON.parse(localStorage.getItem("hostelFeedbacks")) || [];
  const hostelComplaints = JSON.parse(localStorage.getItem("hostelComplaints")) || [];
  const sportsFeedbacks = JSON.parse(localStorage.getItem("sportsFeedbacks")) || [];
  const sportsComplaints = JSON.parse(localStorage.getItem("sportsComplaints")) || [];

  const renderFeedback = (feedbacks) => {
    if (!feedbacks.length) return <p>No feedback submitted yet.</p>;
    return feedbacks.map((f, idx) => (
      <div key={idx} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px", borderRadius: "8px" }}>
        {Object.keys(f).map((k) => k.startsWith("q") && <p key={k}><b>{k}:</b> {f[k]}</p>)}
      </div>
    ));
  };

  const renderComplaints = (complaints) => {
    if (!complaints.length) return <p>No complaints submitted yet.</p>;
    return complaints.map((c, idx) => (
      <div key={idx} style={{ border: "1px solid #f44336", margin: "10px 0", padding: "10px", borderRadius: "8px", background: "#ffe6e6" }}>
        <p>{c.text}</p>
        <small>{c.date}</small>
      </div>
    ));
  };

  return (
    <div className="page-card">
      <h1>Admin Dashboard</h1>
      <div className="action-buttons">
        <button onClick={() => setTab("academics")}>Academics</button>
        <button onClick={() => setTab("hostel")}>Hostel</button>
        <button onClick={() => setTab("sports")}>Sports</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {tab === "academics" && (
          <>
            <h2>Academics Feedback</h2>
            {renderFeedback(academicsFeedbacks)}
            <h2>Academics Complaints</h2>
            {renderComplaints(academicsComplaints)}
          </>
        )}
        {tab === "hostel" && (
          <>
            <h2>Hostel Feedback</h2>
            {renderFeedback(hostelFeedbacks)}
            <h2>Hostel Complaints</h2>
            {renderComplaints(hostelComplaints)}
          </>
        )}
        {tab === "sports" && (
          <>
            <h2>Sports Feedback</h2>
            {renderFeedback(sportsFeedbacks)}
            <h2>Sports Complaints</h2>
            {renderComplaints(sportsComplaints)}
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
