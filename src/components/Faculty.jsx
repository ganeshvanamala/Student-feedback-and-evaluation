import React, { useEffect, useMemo, useState } from "react";
import {
  BTECH_BRANCHES,
  BTECH_YEARS,
  SECTION_OPTIONS,
  getFaculty,
  getSubjects,
  initializeAcademicData,
  saveFaculty,
} from "../utils/academicData";

const emptyAssignment = { subjectId: "", year: 1, section: 1 };

function Faculty() {
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    branch: "CSE",
    teaching: [{ ...emptyAssignment }],
  });

  useEffect(() => {
    initializeAcademicData();
    setSubjects(getSubjects());
    setFacultyList(getFaculty());
  }, []);

  const branchSubjects = useMemo(
    () => subjects.filter((subject) => subject.branch === form.branch),
    [subjects, form.branch]
  );

  const updateTeaching = (index, key, value) => {
    setForm((prev) => {
      const updated = [...prev.teaching];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, teaching: updated };
    });
  };

  const addTeachingRow = () => {
    setForm((prev) => ({ ...prev, teaching: [...prev.teaching, { ...emptyAssignment }] }));
  };

  const removeTeachingRow = (index) => {
    setForm((prev) => {
      if (prev.teaching.length === 1) return prev;
      const updated = prev.teaching.filter((_, idx) => idx !== index);
      return { ...prev, teaching: updated };
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      employeeId: "",
      branch: "CSE",
      teaching: [{ ...emptyAssignment }],
    });
    setEditingId(null);
  };

  const normalizeTeaching = (entries) =>
    entries
      .filter((entry) => entry.subjectId)
      .map((entry) => ({
        subjectId: entry.subjectId,
        year: Number(entry.year),
        section: Number(entry.section),
      }));

  const handleSave = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.employeeId.trim()) return;

    const teaching = normalizeTeaching(form.teaching);
    if (teaching.length === 0) {
      alert("Please add at least one valid subject assignment.");
      return;
    }

    const payload = {
      id: editingId || `fac-${Date.now()}`,
      name: form.name.trim(),
      employeeId: form.employeeId.trim().toUpperCase(),
      branch: form.branch,
      teaching,
    };

    let updated;
    if (editingId) {
      updated = facultyList.map((item) => (item.id === editingId ? payload : item));
    } else {
      updated = [...facultyList, payload];
    }

    setFacultyList(updated);
    saveFaculty(updated);
    resetForm();
  };

  const handleDelete = (id) => {
    const updated = facultyList.filter((item) => item.id !== id);
    setFacultyList(updated);
    saveFaculty(updated);
    if (editingId === id) resetForm();
  };

  const handleEdit = (faculty) => {
    setEditingId(faculty.id);
    setForm({
      name: faculty.name,
      employeeId: faculty.employeeId,
      branch: faculty.branch,
      teaching: (faculty.teaching || []).map((item) => ({ ...item })),
    });
  };

  const getSubjectLabel = (subjectId) => {
    const subject = subjects.find((item) => item.id === subjectId);
    return subject ? `${subject.name} (${subject.code})` : "Unknown Subject";
  };

  return (
    <div className="faculty-container">
      <div className="forms-header">
        <h2>Faculty</h2>
        <p>Manage faculty and assigned subjects by branch/year/section</p>
      </div>

      <form className="subject-form-card" onSubmit={handleSave}>
        <h3>{editingId ? "Edit Faculty" : "Add Faculty"}</h3>
        <div className="subject-form-grid faculty-grid">
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Faculty Name"
            required
          />
          <input
            value={form.employeeId}
            onChange={(e) => setForm((prev) => ({ ...prev, employeeId: e.target.value }))}
            placeholder="Faculty ID"
            required
          />
          <select value={form.branch} onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))}>
            {BTECH_BRANCHES.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div className="teaching-rows">
          {form.teaching.map((assignment, index) => (
            <div key={index} className="teaching-row">
              <select
                value={assignment.subjectId}
                onChange={(e) => updateTeaching(index, "subjectId", e.target.value)}
                required
              >
                <option value="">Select Subject</option>
                {branchSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
              <select value={assignment.year} onChange={(e) => updateTeaching(index, "year", Number(e.target.value))}>
                {BTECH_YEARS.map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
              <select
                value={assignment.section}
                onChange={(e) => updateTeaching(index, "section", Number(e.target.value))}
              >
                {SECTION_OPTIONS.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-small btn-danger" onClick={() => removeTeachingRow(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="faculty-actions">
          <button type="button" className="btn-secondary" onClick={addTeachingRow}>
            Add Subject Assignment
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
          <button type="submit" className="btn-primary">
            {editingId ? "Update Faculty" : "Save Faculty"}
          </button>
        </div>
      </form>

      <div className="subject-cards-grid">
        {facultyList.map((faculty) => (
          <article key={faculty.id} className="subject-card faculty-card">
            <h3>{faculty.name}</h3>
            <p><strong>ID:</strong> {faculty.employeeId}</p>
            <p><strong>Branch:</strong> {faculty.branch}</p>
            <div className="faculty-subjects">
              <strong>Subjects:</strong>
              {(faculty.teaching || []).map((item, idx) => (
                <p key={`${faculty.id}-${idx}`}>
                  {getSubjectLabel(item.subjectId)} | Year {item.year} | Section {item.section}
                </p>
              ))}
            </div>
            <div className="faculty-card-actions">
              <button className="btn-small btn-primary" onClick={() => handleEdit(faculty)}>
                Edit
              </button>
              <button className="btn-small btn-danger" onClick={() => handleDelete(faculty.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Faculty;
