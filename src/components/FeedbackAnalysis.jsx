import React from "react";

function FeedbackAnalysis({ section, feedbacks = [] }) {
  if (!feedbacks.length)
    return (
      <div>
        <h3>{section} Feedback Analysis</h3>
        <p>No feedback data available.</p>
      </div>
    );

  const questionAverages = {};

  feedbacks.forEach((feedback) => {
    Object.keys(feedback).forEach((key) => {
      if (key.startsWith("q") && !Number.isNaN(Number(feedback[key]))) {
        if (!questionAverages[key]) questionAverages[key] = [];
        questionAverages[key].push(Number(feedback[key]));
      }
    });
  });

  return (
    <div>
      <h3>{section} Feedback Analysis</h3>
      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Question</th>
            <th>Average Rating</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(questionAverages).map((question) => {
            const avg =
              questionAverages[question].reduce((sum, value) => sum + value, 0) / questionAverages[question].length;
            return (
              <tr key={question}>
                <td>{question.toUpperCase()}</td>
                <td>{avg.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FeedbackAnalysis;
