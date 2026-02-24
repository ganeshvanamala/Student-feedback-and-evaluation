import React from "react";
import { safeParse } from "../utils/storage";

function ComplaintTable({ section }) {
  const complaints = safeParse(`${section.toLowerCase()}Complaints`, []);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Complaint</th>
            <th style={thStyle}>Date</th>
          </tr>
        </thead>
        <tbody>
          {complaints.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "10px" }}>No complaints yet</td>
            </tr>
          )}
          {complaints.map((c, idx) => (
            <tr key={idx} style={{ textAlign: "center" }}>
              <td style={tdStyle}>{idx + 1}</td>
              <td style={tdStyle}>{c.text}</td>
              <td style={tdStyle}>{c.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { border: "1px solid #ccc", padding: "8px", background: "#eee" };
const tdStyle = { border: "1px solid #ccc", padding: "8px" };

export default ComplaintTable;
