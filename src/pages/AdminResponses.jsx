import React, { useEffect, useState } from "react";
import { filterByCategory, getScopedComplaintRows, getScopedResponseRowsFromForms } from "../domain/selectors";
import { getCurrentUser } from "../auth/session";
import { fetchFormsByCategory } from "../api/formsApi";
import { createReply } from "../api/repliesApi";
import { deleteComplaint, fetchComplaints, setComplaintPlagged } from "../api/complaintsApi";
import { fetchComplaintBlockList, saveComplaintBlockList } from "../api/complaintBlockApi";

const groupComplaintsByCategory = (items = []) =>
  items.reduce(
    (acc, item) => {
      const category = item?.category;
      if (category === "academics" || category === "sports" || category === "hostel") {
        acc[category].push(item);
      }
      return acc;
    },
    { academics: [], sports: [], hostel: [] }
  );

function AdminResponses() {
  const [allResponses, setAllResponses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [viewType, setViewType] = useState("responses");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [formsLoading, setFormsLoading] = useState(true);
  const [formsError, setFormsError] = useState("");

  const loadResponses = async () => {
    setFormsLoading(true);
    setFormsError("");
    try {
      const user = getCurrentUser();
      const [forms, complaintItems] = await Promise.all([fetchFormsByCategory(), fetchComplaints()]);
      setAllResponses(getScopedResponseRowsFromForms(forms, user));
      setComplaints(getScopedComplaintRows(groupComplaintsByCategory(complaintItems), user));
    } catch (error) {
      console.error("API FAILED", error);
      setFormsError("Unable to load data from server.");
      setAllResponses([]);
      setComplaints([]);
    } finally {
      setFormsLoading(false);
    }
  };

  useEffect(() => {
    loadResponses();
  }, []);

  const filteredResponses = filterByCategory(allResponses, filter);
  const filteredComplaints = filterByCategory(complaints, filter);

  const getRatingLabel = (question, value) => {
    if (question.type === "stars") return `${value} star`;
    if (question.type === "levels") return `${value}/10`;
    if (Array.isArray(value)) return value.join(", ");
    return value;
  };

  const handleClearComplaint = async (complaint) => {
    try {
      const complaintId = complaint?.id;
      if (!complaintId) {
        alert("Cannot clear complaint because backend id is missing.");
        return;
      }
      await deleteComplaint(complaintId);
      setComplaints((prev) => prev.filter((item) => item.rowId !== complaint.rowId));
    } catch (error) {
      console.error("API FAILED", error);
      alert("Unable to clear complaint.");
    }
  };

  const handlePlagComplaint = async (complaint) => {
    try {
      const complaintId = complaint?.id;
      if (!complaintId) {
        alert("Cannot mark plagged because backend id is missing.");
        return;
      }

      await setComplaintPlagged(complaintId, true);
      const blocks = await fetchComplaintBlockList();
      const nextBlocks = {
        ...blocks,
        categoryBlocked: { ...(blocks.categoryBlocked || {}) },
      };

      if (complaint.studentId) {
        const existing = Array.isArray(nextBlocks[complaint.category]) ? nextBlocks[complaint.category] : [];
        if (!existing.includes(complaint.studentId)) {
          nextBlocks[complaint.category] = [...existing, complaint.studentId];
        }
      } else {
        nextBlocks.categoryBlocked[complaint.category] = true;
      }

      await saveComplaintBlockList(nextBlocks);
      setComplaints((prev) => prev.map((item) => (item.rowId === complaint.rowId ? { ...item, plagged: true } : item)));
    } catch (error) {
      console.error("API FAILED", error);
      alert("Unable to mark complaint as plagged.");
    }
  };

  const sendReply = async ({ type, category, sourceId, targetUser, replyKey }) => {
    const message = (replyDrafts[replyKey] || "").trim();
    if (!message) {
      alert("Please type a reply message.");
      return;
    }

    if (!targetUser || targetUser === "unknown") {
      alert("This entry has no student username linked, so a reply cannot be sent.");
      return;
    }

    try {
      await createReply({
        type,
        category,
        sourceId,
        targetUser,
        message,
        createdAt: new Date().toLocaleString(),
        isRead: false,
      });
      setReplyDrafts((prev) => ({ ...prev, [replyKey]: "" }));
      alert("Reply sent to student.");
    } catch (error) {
      console.error("API FAILED", error);
      alert("Unable to send reply.");
    }
  };

  return (
    <div className="responses-container">
      <div className="responses-header">
        <h2>{viewType === "responses" ? "Form Responses" : "Complaints"}</h2>
        <p>
          Total: {viewType === "responses" ? filteredResponses.length : filteredComplaints.length}{" "}
          {viewType === "responses" ? "responses" : "complaints"}
        </p>
        {formsLoading && <p>Loading forms...</p>}
        {!formsLoading && formsError && <p>{formsError}</p>}
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
                {complaint.recipientType && <p><strong>Sent To:</strong> {String(complaint.recipientType).toUpperCase()}</p>}
                {complaint.targetHodUsername && <p><strong>HOD Recipient:</strong> {complaint.targetHodUsername}</p>}
                {complaint.targetFacultyUsername && <p><strong>Faculty Recipient:</strong> {complaint.targetFacultyUsername}</p>}
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
