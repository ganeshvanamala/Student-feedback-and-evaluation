import React from "react";

function ComplaintTable({ section, complaints = [] }) {
  if (!complaints.length)
    return (
      <div>
        <h3>{section} Complaints</h3>
        <p>No complaints yet.</p>
      </div>
    );

  return (
    <div>
      <h3>{section} Complaints ({complaints.length})</h3>
      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Complaint</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint, index) => (
            <tr key={index}>
              <td>{complaint.complaintId || index + 1}</td>
              <td>{complaint.text}</td>
              <td>{complaint.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ComplaintTable;
