import React, { useEffect, useState } from "react";
import { safeParse } from "../utils/storage";
import { filterByCategory, getScopedComplaintRows, getScopedResponseRowsFromForms } from "../domain/selectors";
import { getCurrentUser } from "../auth/session";

function AdminResponses() {
  const [allResponses, setAllResponses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [viewType, setViewType] = useState("responses");
  const [replyDrafts, setReplyDrafts] = useState({});

  useEffect(() => {
    const user = getCurrentUser();
    const forms = safeParse("adminForms", {});
    setAllResponses(getScopedResponseRowsFromForms(forms, user));

    const acadComplaints = safeParse("academicsComplaints", []);
    const sportComplaints = safeParse("sportsComplaints", []);
    const hostelComplaints = safeParse("hostelComplaints", []);
    setComplaints(
      getScopedComplaintRows(
        {
          academics: acadComplaints,
          sports: sportComplaints,
          hostel: hostelComplaints,
        },
        user
      )
    );
  }, []);

  const filteredResponses = filterByCategory(allResponses, filter);
  const filteredComplaints = filterByCategory(complaints, filter);

  const getRatingLabel = (question, value) => {
    if (question.type === "stars") return `${value} star`;
    if (question.type === "levels") return `${value}/10`;
    if (Array.isArray(value)) return value.join(", ");
    return value;
  };

  const parseStoredComplaints = (category) => {
    if (category === "academics") return safeParse("academicsComplaints", []);
    if (category === "sports") return safeParse("sportsComplaints", []);
    if (category === "hostel") return safeParse("hostelComplaints", []);
    return [];
  };

  const saveStoredComplaints = (category, arr) => {
    if (category === "academics") localStorage.setItem("academicsComplaints", JSON.stringify(arr));
    if (category === "sports") localStorage.setItem("sportsComplaints", JSON.stringify(arr));
    if (category === "hostel") localStorage.setItem("hostelComplaints", JSON.stringify(arr));
  };

  const handleClearComplaint = (complaint) => {
    const stored = parseStoredComplaints(complaint.category);
    const targetIndex = stored.findIndex((item) => item.complaintId === complaint.complaintId);
    if (targetIndex !== -1) {
      stored.splice(targetIndex, 1);
      saveStoredComplaints(complaint.category, stored);
    } else if (stored[complaint.storageIndex]) {
      stored.splice(complaint.storageIndex, 1);
      saveStoredComplaints(complaint.category, stored);
    }
    setComplaints((prev) => prev.filter((item) => item.rowId !== complaint.rowId));
  };

  const handlePlagComplaint = (complaint) => {
    const stored = parseStoredComplaints(complaint.category);
    const targetIndex = stored.findIndex((item) => item.complaintId === complaint.complaintId);
    if (targetIndex !== -1) {
      stored[targetIndex].plagged = true;
      saveStoredComplaints(complaint.category, stored);
    } else if (stored[complaint.storageIndex]) {
      stored[complaint.storageIndex].plagged = true;
      saveStoredComplaints(complaint.category, stored);
    }

    const blocks = safeParse("complaintBlockList", {
      academics: [],
      sports: [],
      hostel: [],
      categoryBlocked: {},
    });

    if (complaint.studentId) {
      if (!blocks[complaint.category]) blocks[complaint.category] = [];
      if (!blocks[complaint.category].includes(complaint.studentId)) blocks[complaint.category].push(complaint.studentId);
    } else {
      blocks.categoryBlocked = blocks.categoryBlocked || {};
      blocks.categoryBlocked[complaint.category] = true;
    }

    localStorage.setItem("complaintBlockList", JSON.stringify(blocks));
    setComplaints((prev) => prev.map((item) => (item.rowId === complaint.rowId ? { ...item, plagged: true } : item)));
  };

  const sendReply = ({ type, category, sourceId, targetUser, replyKey }) => {
    const message = (replyDrafts[replyKey] || "").trim();
    if (!message) {
      alert("Please type a reply message.");
      return;
    }

    if (!targetUser || targetUser === "unknown") {
      alert("This entry has no student username linked, so a reply cannot be sent.");
      return;
    }

    const existingReplies = safeParse("studentReplies", []);
    const newReply = {
      id: Date.now(),
      type,
      category,
      sourceId,
      targetUser,
      message,
      createdAt: new Date().toLocaleString(),
      isRead: false,
    };

    localStorage.setItem("studentReplies", JSON.stringify([...existingReplies, newReply]));
    setReplyDrafts((prev) => ({ ...prev, [replyKey]: "" }));
    alert("Reply sent to student.");
  };

  return (
    <div className="responses-container">
      <div className="responses-header">
        <h2>{viewType === "responses" ? "Form Responses" : "Complaints"}</h2>
        <p>
          Total: {viewType === "responses" ? filteredResponses.length : filteredComplaints.length}{" "}
          {viewType === "responses" ? "responses" : "complaints"}
        </p>
      </div>

      <div className="filter-section">
        <label>View:</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className={`filter-btn ${viewType === "responses" ? "active" : ""}`} onClick={() => setViewType("responses")}>
            Form Responses
          </button>
          <button className={`filter-btn ${viewType === "complaints" ? "active" : ""}`} onClick={() => setViewType("complaints")}>
            Complaints
          </button>
        </div>

        <label>Filter by Category:</label>
        <div className="filter-buttons">
          {["all", "academics", "sports", "hostel"].map((type) => (
            <button key={type} className={`filter-btn ${filter === type ? "active" : ""}`} onClick={() => setFilter(type)}>
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="responses-list">
        {viewType === "responses" ? (
          filteredResponses.length === 0 ? (
            <div className="empty-state">
              <p>No responses yet</p>
              <p>Form responses will appear here as students submit feedback.</p>
            </div>
          ) : (
            filteredResponses.map((response) => (
              <div key={response.id} className="response-card">
                <div className="response-header">
                  <div>
                    <span className="response-type">{response.formTitle}</span>
                    <span className="response-category">{response.category}</span>
                  </div>
                  <span className="response-date">{response.timestamp}</span>
                </div>

                <div className="response-body">
                  <p><strong>Student Username:</strong> {response.submittedBy}</p>
                  {response.contextData?.course && (
                    <p>
                      <strong>Academic Context:</strong>{" "}
                      {response.contextData.course}
                      {response.contextData.courseCode ? ` (${response.contextData.courseCode})` : ""}
                      {" | "}{response.contextData.dept} | Year {response.contextData.year}
                      {response.contextData.faculty ? ` | ${response.contextData.faculty}` : ""}
                    </p>
                  )}
                  <div className="response-answers">
                    {response.questions.map((question) => (
                      <div key={question.id} className="answer-item">
                        <p className="answer-question">{question.text}</p>
                        <p className="answer-value">{getRatingLabel(question, response.answers[question.id])}</p>
                      </div>
                    ))}
                  </div>

                  <textarea
                    value={replyDrafts[response.replyKey] || ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [response.replyKey]: e.target.value }))}
                    placeholder="Reply to student..."
                    style={{ width: "100%", marginTop: 12, minHeight: 80, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                  />
                  <button
                    className="filter-btn active"
                    style={{ marginTop: 8 }}
                    onClick={() =>
                      sendReply({
                        type: "response",
                        category: response.category,
                        sourceId: response.id,
                        targetUser: response.submittedBy,
                        replyKey: response.replyKey,
                      })
                    }
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            ))
          )
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints yet</p>
            <p>Student complaints will appear here as they are submitted.</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div key={complaint.rowId} className="response-card">
              <div className="response-header">
                <div>
                  <span className="response-type">Complaint</span>
                  <span className="response-category">{complaint.category}</span>
                </div>
                <span className="response-date">{complaint.date || ""}</span>
              </div>

              <div className="response-body">
                <p><strong>Student Username:</strong> {complaint.submittedBy}</p>
                {complaint.faculty && <p><strong>Faculty:</strong> {complaint.faculty}</p>}
                {complaint.course && <p><strong>Subject:</strong> {complaint.course} {complaint.courseCode ? `(${complaint.courseCode})` : ""}</p>}
                {complaint.dept && <p><strong>Branch:</strong> {complaint.dept}</p>}
                {complaint.year && <p><strong>Year:</strong> {complaint.year}</p>}
                {complaint.name && <p><strong>Name:</strong> {complaint.name}</p>}
                {complaint.studentId && <p><strong>Student ID:</strong> {complaint.studentId}</p>}
                {complaint.hostel && <p><strong>Hostel:</strong> {complaint.hostel}</p>}
                {complaint.sport && <p><strong>Sport:</strong> {complaint.sport}</p>}
                <p><strong>Complaint:</strong> {complaint.text}</p>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => handleClearComplaint(complaint)}
                    style={{
                      background: "#c62828",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => handlePlagComplaint(complaint)}
                    disabled={complaint.plagged}
                    style={{
                      background: complaint.plagged ? "#8aa" : "#1976d2",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 6,
                      cursor: complaint.plagged ? "default" : "pointer",
                    }}
                  >
                    {complaint.plagged ? "Plagged" : "Plag"}
                  </button>
                </div>

                <textarea
                  value={replyDrafts[complaint.replyKey] || ""}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [complaint.replyKey]: e.target.value }))}
                  placeholder="Reply to student..."
                  style={{ width: "100%", marginTop: 12, minHeight: 80, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />
                <button
                  className="filter-btn active"
                  style={{ marginTop: 8 }}
                  onClick={() =>
                    sendReply({
                      type: "complaint",
                      category: complaint.category,
                      sourceId: complaint.rowId,
                      targetUser: complaint.submittedBy,
                      replyKey: complaint.replyKey,
                    })
                  }
                >
                  Send Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminResponses;
