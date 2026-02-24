import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const getCategoryForms = (allForms, categoryId) => {
  const value = allForms?.[categoryId];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

function FormViewer({ categoryId, categoryName, contextData = {}, formId }) {
  const navigate = useNavigate();
  const [formsState, setFormsState] = useState(() => {
    const saved = localStorage.getItem("adminForms");
    return saved ? JSON.parse(saved) : {};
  });
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const form = useMemo(() => {
    const forms = getCategoryForms(formsState, categoryId);
    const byId = forms.find((item) => String(item.id) === String(formId));
    return byId || forms[0] || null;
  }, [formsState, categoryId, formId]);

  if (submitted) {
    return (
      <div className="form-success-card">
        <div className="success-icon">Done</div>
        <h2>Thank You!</h2>
        <p>Your {categoryName} feedback has been submitted successfully.</p>
        <button onClick={() => navigate(-1)} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="no-form-card">
        <h2>No Form Available</h2>
        <p>There is no {categoryName} form available at the moment.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (categoryId === "academics") {
      const studentYear = Number(contextData?.year || 0);
      const targetYear = Number(form.targetYear || 0);

      if (targetYear > 0 && studentYear !== targetYear) {
        alert("You are not eligible to fill this form for your current year.");
        return;
      }

      const subjectMatchById = !!form.targetSubjectId && contextData?.subjectId === form.targetSubjectId;
      const subjectMatchByCode =
        !!form.targetSubjectCode &&
        !!contextData?.courseCode &&
        String(form.targetSubjectCode).toUpperCase() === String(contextData.courseCode).toUpperCase();
      const subjectMatchByName =
        !!form.targetSubjectName &&
        !!contextData?.course &&
        String(form.targetSubjectName).trim().toLowerCase() === String(contextData.course).trim().toLowerCase();

      if (
        (form.targetSubjectId || form.targetSubjectCode || form.targetSubjectName) &&
        !(subjectMatchById || subjectMatchByCode || subjectMatchByName)
      ) {
        alert("You are not eligible to fill this form for the selected subject.");
        return;
      }

      if (form.sendToAll === false && !form.targetSubjectId) {
        alert("This form target configuration is incomplete.");
        return;
      }
    }

    const allAnswered = (form.questions || []).every((q) => responses[q.id] !== undefined && responses[q.id] !== "");
    if (!allAnswered) {
      alert("Please answer all questions");
      return;
    }

    const submittedBy = localStorage.getItem("currentStudent") || "unknown";
    const response = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      answers: responses,
      category: categoryId,
      submittedBy,
      contextData,
    };

    const nextFormsState = { ...formsState };
    const categoryForms = getCategoryForms(nextFormsState, categoryId);
    const targetIndex = categoryForms.findIndex((item) => String(item.id) === String(form.id));
    if (targetIndex === -1) return;
    const updatedCategoryForms = [...categoryForms];
    updatedCategoryForms[targetIndex] = {
      ...updatedCategoryForms[targetIndex],
      responses: [...(updatedCategoryForms[targetIndex].responses || []), response],
    };
    nextFormsState[categoryId] = updatedCategoryForms;

    localStorage.setItem("adminForms", JSON.stringify(nextFormsState));
    setFormsState(nextFormsState);
    setSubmitted(true);
  };

  const renderQuestion = (question, idx) => {
    const value = responses[question.id];

    if (question.type === "stars") {
      return (
        <div key={question.id} className="question-wrapper">
          <label className="question-label">
            Q{idx + 1}. {question.text}
          </label>
          <div className="stars-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} className={`star ${value === star ? "active" : ""}`} onClick={() => handleResponseChange(question.id, star)}>
                *
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (question.type === "radio-5") {
      return (
        <div key={question.id} className="question-wrapper">
          <label className="question-label">
            Q{idx + 1}. {question.text}
          </label>
          <div className="radio-buttons-rating">
            {[1, 2, 3, 4, 5].map((num) => (
              <label key={num} className="radio-label">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={num}
                  checked={value === num}
                  onChange={() => handleResponseChange(question.id, num)}
                />
                <span className="radio-circle">{num}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (question.type === "slider") {
      return (
        <div key={question.id} className="question-wrapper">
          <label className="question-label">
            Q{idx + 1}. {question.text}
          </label>
          <div className="slider-rating">
            <input
              type="range"
              min="1"
              max="10"
              value={value || 5}
              onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value, 10))}
              className="slider-input"
            />
            <div className="slider-labels">
              <span>1</span>
              <span className="slider-value">{value || 5}</span>
              <span>10</span>
            </div>
          </div>
        </div>
      );
    }

    if (question.type === "checkbox") {
      return (
        <div key={question.id} className="question-wrapper">
          <label className="question-label">
            Q{idx + 1}. {question.text}
          </label>
          <div className="checkboxes-rating">
            {question.options?.map((option, optIdx) => (
              <label key={optIdx} className="checkbox-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValue = value || [];
                    if (e.target.checked) handleResponseChange(question.id, [...currentValue, option]);
                    else handleResponseChange(question.id, currentValue.filter((v) => v !== option));
                  }}
                />
                <span className="checkbox-box">[]</span>
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (question.type === "multiple-choice") {
      return (
        <div key={question.id} className="question-wrapper">
          <label className="question-label">
            Q{idx + 1}. {question.text}
          </label>
          <div className="options-list">
            {question.options?.map((option, optIdx) => (
              <label key={optIdx} className="option-label">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={() => handleResponseChange(question.id, option)}
                />
                <span className="option-circle">o</span>
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="form-viewer-container">
      <div className="form-header-section">
        <h1>{form.title}</h1>
        <p>{categoryName} Feedback Form</p>
      </div>

      <div className="form-questions-section">{form.questions?.map((question, idx) => renderQuestion(question, idx))}</div>

      <div className="form-actions-section">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Cancel
        </button>
        <button onClick={handleSubmit} className="btn-primary">
          Submit Feedback
        </button>
      </div>
    </div>
  );
}

export default FormViewer;
