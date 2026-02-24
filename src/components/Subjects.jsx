import React, { useEffect, useState } from "react";
import {
  BTECH_BRANCHES,
  BTECH_YEARS,
  getSubjects,
  initializeAcademicData,
  removeSubjectFromFaculty,
  saveSubjects,
} from "../utils/academicData";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    branch: "CSE",
    year: 1,
  });

  useEffect(() => {
    initializeAcademicData();
    setSubjects(getSubjects());
  }, []);

  const handleAdd = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    if (subjects.some((item) => item.code.toLowerCase() === form.code.trim().toLowerCase())) {
      alert("Subject code already exists.");
      return;
    }

    const newSubject = {
      id: `sub-${Date.now()}`,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      branch: form.branch,
      year: Number(form.year),
    };

    const updated = [...subjects, newSubject];
    setSubjects(updated);
    saveSubjects(updated);
    setForm({ name: "", code: "", branch: "CSE", year: 1 });
  };

  const handleDelete = (subjectId) => {
    const updated = subjects.filter((subject) => subject.id !== subjectId);
    setSubjects(updated);
    saveSubjects(updated);
    removeSubjectFromFaculty(subjectId);
  };

  return (
    <div className="subjects-container">
      <div className="forms-header">
        <h2>Subjects</h2>
        <p>Manage B.Tech subjects by branch and year</p>
      </div>

      <form className="subject-form-card" onSubmit={handleAdd}>
        <h3>Add Subject</h3>
        <div className="subject-form-grid">
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Subject Name"
            required
          />
          <input
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
            placeholder="Subject Code"
            required
          />
          <select value={form.branch} onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))}>
            {BTECH_BRANCHES.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <select value={form.year} onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}>
            {BTECH_YEARS.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Add Subject
          </button>
        </div>
      </form>

      <div className="subject-cards-grid">
        {subjects.map((subject) => (
          <article key={subject.id} className="subject-card">
            <h3>{subject.name}</h3>
            <p><strong>Code:</strong> {subject.code}</p>
            <p><strong>Branch:</strong> {subject.branch}</p>
            <p><strong>Year:</strong> {subject.year}</p>
            <button className="btn-small btn-danger" onClick={() => handleDelete(subject.id)}>
              Delete
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Subjects;
