import React from "react";

function FeedbackAnalysis({ section }) {
  const feedbacks = JSON.parse(localStorage.getItem(`${section.toLowerCase()}Feedbacks`)) || [];

  if (feedbacks.length === 0) return <p style={{ textAlign: "center" }}>No feedback to analyze</p>;

  const avgScores = [];
  for (let i = 1; i <= 14; i++) {
    let sum = 0;
    feedbacks.forEach(fb => { sum += parseInt(fb[`q${i}`] || 0); });
    avgScores.push((sum / feedbacks.length).toFixed(2));
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center", color: "#2575fc" }}>Average Scores (1-5)</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr>
            {[...Array(14)].map((_, i) => (
              <th key={i} style={thStyle}>Q{i+1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={{ textAlign: "center" }}>
            {avgScores.map((a, i) => (
              <td key={i} style={tdStyle}>{a}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { border: "1px solid #ccc", padding: "8px", background: "#eee" };
const tdStyle = { border: "1px solid #ccc", padding: "8px" };

export default FeedbackAnalysis;
