import React, { useEffect, useState } from "react";
import { fetchFormsByCategory } from "../api/formsApi";
import { fetchComplaints } from "../api/complaintsApi";

function Admin() {
  const [tab, setTab] = useState("academics");
  const [feedbackByCategory, setFeedbackByCategory] = useState({ academics: [], hostel: [], sports: [] });
  const [complaintsByCategory, setComplaintsByCategory] = useState({ academics: [], hostel: [], sports: [] });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [forms, complaints] = await Promise.all([fetchFormsByCategory(), fetchComplaints()]);

        const flattenResponses = (category) =>
          (forms[category] || []).flatMap((form) =>
            (form.responses || []).map((response) => ({
              ...response,
              formTitle: form.title,
              questions: form.questions || [],
            }))
          );

        setFeedbackByCategory({
          academics: flattenResponses("academics"),
          hostel: flattenResponses("hostel"),
          sports: flattenResponses("sports"),
        });

        const groupedComplaints = { academics: [], hostel: [], sports: [] };
        (complaints || []).forEach((item) => {
          if (groupedComplaints[item.category]) groupedComplaints[item.category].push(item);
        });
        setComplaintsByCategory(groupedComplaints);
      } catch (error) {
        console.error("API FAILED", error);
      }
    };

    loadData();
  }, []);

  const renderFeedback = (feedbacks) => {
    if (!feedbacks.length) return <p>No feedback submitted yet.</p>;
    return feedbacks.map((f, idx) => (
      <div key={idx} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px", borderRadius: "8px" }}>
        <p><b>Form:</b> {f.formTitle}</p>
        {(f.questions || []).map((q) => (
          <p key={q.id}><b>{q.text}:</b> {String(f.answers?.[q.id] ?? "")}</p>
        ))}
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
      <h1>Dashboard</h1>
      <div className="action-buttons">
        <button onClick={() => setTab("academics")}>Academics</button>
        <button onClick={() => setTab("hostel")}>Hostel</button>
        <button onClick={() => setTab("sports")}>Sports</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {tab === "academics" && (
          <>
            <h2>Academics Feedback</h2>
            {renderFeedback(feedbackByCategory.academics)}
            <h2>Academics Complaints</h2>
            {renderComplaints(complaintsByCategory.academics)}
          </>
        )}
        {tab === "hostel" && (
          <>
            <h2>Hostel Feedback</h2>
            {renderFeedback(feedbackByCategory.hostel)}
            <h2>Hostel Complaints</h2>
            {renderComplaints(complaintsByCategory.hostel)}
          </>
        )}
        {tab === "sports" && (
          <>
            <h2>Sports Feedback</h2>
            {renderFeedback(feedbackByCategory.sports)}
            <h2>Sports Complaints</h2>
            {renderComplaints(complaintsByCategory.sports)}
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
