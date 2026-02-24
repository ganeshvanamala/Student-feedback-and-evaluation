import React, { useEffect, useRef, useState } from "react";
import { getSubjects, initializeAcademicData } from "../utils/academicData";
import academicsLightImg from "../assets/acadamics.jpg";
import academicsDarkImg from "../assets/acadamics dark.png";
import sportsLightImg from "../assets/sports.png";
import sportsDarkImg from "../assets/sports darkmode.png";
import hostelLightImg from "../assets/hostel.png";
import hostelDarkImg from "../assets/Hostel darkmode.png";

const CATEGORY_LIST = [
  { id: "academics", label: "Academics", imageLight: academicsLightImg, imageDark: academicsDarkImg },
  { id: "sports", label: "Sports", imageLight: sportsLightImg, imageDark: sportsDarkImg },
  { id: "hostel", label: "Hostel", imageLight: hostelLightImg, imageDark: hostelDarkImg },
];

const normalizeFormsByCategory = (raw) => {
  const normalized = { academics: [], sports: [], hostel: [] };
  Object.entries(raw || {}).forEach(([categoryId, value]) => {
    if (!normalized[categoryId]) normalized[categoryId] = [];
    if (Array.isArray(value)) {
      normalized[categoryId] = value.filter(Boolean);
      return;
    }
    if (value && typeof value === "object") {
      normalized[categoryId] = [value];
    }
  });
  return normalized;
};

function QuestionBuilder({
  activeCategory,
  onClose,
  onSave,
  formTitle,
  setFormTitle,
  questions,
  addQuestion,
  updateQuestion,
  removeQuestion,
  subjects,
  sendToAll,
  setSendToAll,
  targetSubjectId,
  setTargetSubjectId,
  titleRef,
}) {
  const ratingTypes = [
    { value: "stars", label: "5-Star Rating" },
    { value: "radio-5", label: "Radio Buttons (1-5)" },
    { value: "slider", label: "Slider (1-10)" },
    { value: "checkbox", label: "Checkboxes (Multiple)" },
    { value: "multiple-choice", label: "Multiple Choice (Single)" },
  ];

  return (
    <div className="form-builder-overlay">
      <div className="form-builder-card">
        <div className="builder-header">
          <h2>Create Form - {activeCategory?.toUpperCase()}</h2>
          <button className="btn-close" onClick={onClose}>
            X
          </button>
        </div>

        <div className="builder-body">
          <div className="form-group">
            <label>Form Title:</label>
            <input
              ref={titleRef}
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Enter form title"
              className="form-title-input"
            />
          </div>

          {activeCategory === "academics" && (
            <div className="form-group">
              <label>Send Form To:</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={sendToAll}
                    onChange={(e) => {
                      setSendToAll(e.target.checked);
                      if (e.target.checked) setTargetSubjectId("");
                    }}
                  />
                  Send To All Students
                </label>
              </div>
              <select
                value={targetSubjectId}
                onChange={(e) => setTargetSubjectId(e.target.value)}
                disabled={sendToAll}
                className="question-type"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code}) - {subject.branch} Year {subject.year}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="questions-section">
            <h3>Questions ({questions.length})</h3>
            {questions.map((question, idx) => (
              <div key={question.id} className="question-card">
                <div className="question-number">Q{idx + 1}</div>
                <div className="question-content">
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                    placeholder="Enter question text"
                    className="question-input"
                    maxLength="500"
                  />

                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(question.id, "type", e.target.value)}
                    className="question-type"
                  >
                    {ratingTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  {(question.type === "multiple-choice" || question.type === "checkbox") && (
                    <div className="options-input">
                      <label>Options (comma separated):</label>
                      <input
                        type="text"
                        value={(question.options || []).join(", ")}
                        onChange={(e) =>
                          updateQuestion(
                            question.id,
                            "options",
                            e.target.value
                              .split(",")
                              .map((o) => o.trim())
                              .filter(Boolean)
                          )
                        }
                        placeholder="Option1, Option2, Option3"
                        className="options-list-input"
                      />
                    </div>
                  )}
                </div>
                <button className="btn-remove" onClick={() => removeQuestion(question.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>

          <button className="btn-add-question" onClick={addQuestion}>
            + Add Question
          </button>
        </div>

        <div className="builder-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onSave}>
            Save Form
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminForms() {
  const [formsByCategory, setFormsByCategory] = useState(() => {
    const saved = localStorage.getItem("adminForms");
    return normalizeFormsByCategory(saved ? JSON.parse(saved) : {});
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showHistoryFor, setShowHistoryFor] = useState(null);
  const [viewingForm, setViewingForm] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [formTitle, setFormTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [targetSubjectId, setTargetSubjectId] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("homeTheme") || "light");
  const titleRef = useRef(null);

  useEffect(() => {
    initializeAcademicData();
    setSubjects(getSubjects());
  }, []);

  useEffect(() => {
    const onThemeChange = (event) => setTheme(event?.detail || localStorage.getItem("homeTheme") || "light");
    const onStorage = (event) => {
      if (event.key === "homeTheme") setTheme(event.newValue || "light");
    };
    window.addEventListener("site-theme-change", onThemeChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("site-theme-change", onThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const persistForms = (next) => {
    setFormsByCategory(next);
    localStorage.setItem("adminForms", JSON.stringify(next));
  };

  const openCreate = (categoryId) => {
    setActiveCategory(categoryId);
    setFormTitle("");
    setQuestions([]);
    setSendToAll(true);
    setTargetSubjectId("");
    setShowBuilder(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { id: Date.now() + Math.random(), text: "", type: "stars", options: [] }]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const saveForm = () => {
    if (!formTitle.trim()) {
      alert("Please enter form title.");
      return;
    }
    if (!questions.length || questions.some((q) => !q.text?.trim())) {
      alert("Add at least one valid question.");
      return;
    }

    let targetSubject = null;
    if (activeCategory === "academics" && !sendToAll) {
      targetSubject = subjects.find((subject) => subject.id === targetSubjectId);
      if (!targetSubject) {
        alert("Choose subject or enable Send To All.");
        return;
      }
    }

    const newForm = {
      id: Date.now(),
      title: formTitle.trim(),
      category: activeCategory,
      questions,
      createdAt: new Date().toLocaleDateString(),
      responses: [],
      sendToAll: activeCategory === "academics" ? sendToAll : true,
      targetSubjectId: targetSubject?.id || "",
      targetSubjectCode: targetSubject?.code || "",
      targetSubjectName: targetSubject?.name || "",
      targetYear: targetSubject?.year || "",
      targetBranch: targetSubject?.branch || "",
    };

    const next = {
      ...formsByCategory,
      [activeCategory]: [newForm, ...(formsByCategory[activeCategory] || [])],
    };

    persistForms(next);
    setShowBuilder(false);
    setFormTitle("");
    setQuestions([]);
    alert("Form created.");
  };

  const deleteForm = (categoryId, formId) => {
    if (!window.confirm("Delete this form?")) return;
    const next = {
      ...formsByCategory,
      [categoryId]: (formsByCategory[categoryId] || []).filter((form) => String(form.id) !== String(formId)),
    };
    persistForms(next);
    if (String(viewingForm?.id) === String(formId)) setViewingForm(null);
  };

  return (
    <div className="forms-container">
      {showBuilder && (
        <QuestionBuilder
          activeCategory={activeCategory}
          onClose={() => setShowBuilder(false)}
          onSave={saveForm}
          formTitle={formTitle}
          setFormTitle={setFormTitle}
          questions={questions}
          addQuestion={addQuestion}
          updateQuestion={updateQuestion}
          removeQuestion={removeQuestion}
          subjects={subjects}
          sendToAll={sendToAll}
          setSendToAll={setSendToAll}
          targetSubjectId={targetSubjectId}
          setTargetSubjectId={setTargetSubjectId}
          titleRef={titleRef}
        />
      )}

      <div className="forms-header">
        <h2>Forms Management</h2>
        <p>Create forms and view history by category.</p>
      </div>

      <div className="categories-grid">
        {CATEGORY_LIST.map((category) => {
          const categoryForms = formsByCategory[category.id] || [];
          const cardImage = theme === "dark" ? category.imageDark : category.imageLight;
          return (
            <div key={category.id} className="category-card">
              <img src={cardImage} alt={category.label} className="category-image" />
              <p className="form-meta">{categoryForms.length} total form(s)</p>
              <div className="form-actions">
                <button className="btn-small btn-primary" onClick={() => openCreate(category.id)}>
                  Create
                </button>
                <button
                  className="btn-small btn-info"
                  onClick={() => setShowHistoryFor((prev) => (prev === category.id ? null : category.id))}
                >
                  History
                </button>
              </div>

              {showHistoryFor === category.id && (
                <div className="forms-history-list">
                  {!categoryForms.length ? (
                    <p className="form-meta">No forms created yet.</p>
                  ) : (
                    categoryForms.map((form) => (
                      <div key={form.id} className="history-item">
                        <div>
                          <p className="form-title">{form.title}</p>
                          <p className="form-meta">
                            {form.questions?.length || 0} questions | {form.responses?.length || 0} responses |{" "}
                            {form.createdAt}
                          </p>
                        </div>
                        <div className="history-actions">
                          <button className="btn-small btn-warning" onClick={() => setViewingForm(form)}>
                            View
                          </button>
                          <button className="btn-small btn-danger" onClick={() => deleteForm(category.id, form.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {viewingForm && (
        <div className="form-builder-overlay">
          <div className="form-builder-card">
            <div className="builder-header">
              <h2>Form Details</h2>
              <button className="btn-close" onClick={() => setViewingForm(null)}>
                X
              </button>
            </div>
            <div className="builder-body">
              <h3>{viewingForm.title}</h3>
              <p className="form-meta">
                Category: {viewingForm.category} | Created: {viewingForm.createdAt} | Responses:{" "}
                {viewingForm.responses?.length || 0}
              </p>
              {viewingForm.category === "academics" && (
                <p className="form-meta">
                  {viewingForm.sendToAll
                    ? "Target: All Students"
                    : `Target: ${viewingForm.targetSubjectName || "Subject"} | Year ${viewingForm.targetYear || "-"}`}
                </p>
              )}
              <div className="questions-section">
                {viewingForm.questions?.map((question, index) => (
                  <div key={question.id} className="question-card">
                    <div className="question-number">Q{index + 1}</div>
                    <div className="question-content">
                      <p className="form-title">{question.text}</p>
                      <p className="form-meta">Type: {question.type}</p>
                      {(question.options || []).length > 0 && (
                        <p className="form-meta">Options: {question.options.join(", ")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="builder-footer">
              <button className="btn-secondary" onClick={() => setViewingForm(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminForms;
