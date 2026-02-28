import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormViewer from "./FormViewer";
import { getEligibleFormsForStudent, getFormsForCategory } from "../domain/selectors";

function CategoryFeedback({ categoryId, categoryName }) {
  const [forms] = useState(() => {
    const saved = localStorage.getItem("adminForms");
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedFormId, setSelectedFormId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const contextData = location.state || {};
  const formsForCategory = useMemo(
    () => getFormsForCategory(forms, categoryId),
    [forms, categoryId]
  );
  const hasAcademicContext = Number(contextData?.year || 0) > 0 && !!contextData?.subjectId;
  const eligibleForms = useMemo(
    () => getEligibleFormsForStudent(forms, categoryId, contextData),
    [forms, categoryId, contextData]
  );
  const needsAcademicSelection = categoryId === "academics" && !hasAcademicContext;

  if (selectedFormId) {
    return (
      <div>
        <button
          onClick={() => setSelectedFormId(null)}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            padding: "10px 20px",
            background: "#2575fc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            zIndex: 10,
          }}
        >
          Back to Forms
        </button>
        <FormViewer
          categoryId={categoryId}
          categoryName={categoryName}
          contextData={contextData}
          formId={selectedFormId}
        />
      </div>
    );
  }

  return (
    <div className="category-feedback-container">
      <div className="feedback-card">
        <h1>{categoryName} Feedback</h1>

        {!formsForCategory.length ? (
          <div className="no-form-message">
            <p className="no-form-icon">No forms</p>
            <h2>No Forms Available</h2>
            <p>There are currently no {categoryName} feedback forms available.</p>
            <button
              onClick={() => navigate(-1)}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: "#2575fc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Go Back
            </button>
          </div>
        ) : needsAcademicSelection ? (
          <div className="no-form-message">
            <h2>Select Subject First</h2>
            <p>Please select your year, branch, and subject in Academics.</p>
            <button
              onClick={() => navigate("/academics")}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: "#2575fc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Go To Academics
            </button>
          </div>
        ) : !eligibleForms.length ? (
          <div className="no-form-message">
            <h2>No Eligible Form</h2>
            <p>Forms exist, but none match your subject/year.</p>
            <button
              onClick={() => navigate(-1)}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: "#2575fc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="form-list">
            {eligibleForms.map((form) => (
              <div
                key={form.id}
                className="form-item"
                onClick={() => setSelectedFormId(form.id)}
                style={{
                  padding: "20px",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  cursor: "pointer",
                }}
              >
                <h2 style={{ margin: "0 0 10px 0", color: "#2575fc" }}>{form.title}</h2>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  {form.questions?.length || 0} question{(form.questions?.length || 0) !== 1 ? "s" : ""}
                </p>
                {categoryId === "academics" && (
                  <p style={{ margin: "5px 0", color: "#666" }}>
                    {form.sendToAll !== false
                      ? "Target: All Students"
                      : `Subject: ${form.targetSubjectName || "Selected Subject"}${form.targetYear ? ` | Year ${form.targetYear}` : ""}`}
                  </p>
                )}
                <p style={{ margin: "5px 0", color: "#999", fontSize: "14px" }}>Created: {form.createdAt}</p>
                <button
                  style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    background: "#2575fc",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Fill Form
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryFeedback;
