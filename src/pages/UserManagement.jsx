import React, { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../auth/session";
import { ROLES } from "../auth/roles";
import { canCreateUser } from "../auth/accessControl";
import { DEPARTMENTS, getDepartmentNameById } from "../utils/departments";
import { getSubjects, initializeAcademicData } from "../utils/academicData";
import { readJSON, writeJSON } from "../utils/storage";
import { STORAGE_KEYS } from "../data/keys";

const emptyForm = {
  fullName: "",
  employeeId: "",
  email: "",
  username: "",
  password: "",
  departmentId: "",
  subjectIds: [],
};

function UserManagement() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [subjects, setSubjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    initializeAcademicData();
    setCurrentUser(getCurrentUser());
    setSubjects(getSubjects());
    setUsers(readJSON(STORAGE_KEYS.REGISTERED_USERS, []));
  }, []);

  const isAdmin = currentUser.role === ROLES.ADMIN;
  const isHod = currentUser.role === ROLES.HOD;
  const targetRole = isAdmin ? ROLES.HOD : ROLES.FACULTY;

  const availableDepartments = useMemo(() => {
    if (isAdmin) return DEPARTMENTS;
    if (isHod) {
      const allowed = new Set(currentUser.departmentIds || []);
      return DEPARTMENTS.filter((department) => allowed.has(department.id));
    }
    return [];
  }, [currentUser, isAdmin, isHod]);

  const selectedDepartmentId = isAdmin ? form.departmentId : currentUser.departmentIds?.[0] || "";
  const availableSubjects = useMemo(
    () => subjects.filter((subject) => subject.departmentId === selectedDepartmentId),
    [subjects, selectedDepartmentId]
  );

  const createdUsers = useMemo(() => {
    if (isAdmin) return users.filter((user) => user.role === ROLES.HOD);
    if (isHod) {
      const allowed = new Set(currentUser.departmentIds || []);
      return users.filter(
        (user) => user.role === ROLES.FACULTY && (user.departmentIds || []).some((id) => allowed.has(id))
      );
    }
    return [];
  }, [currentUser.departmentIds, isAdmin, isHod, users]);

  const handleSubjectToggle = (subjectId) => {
    setForm((prev) => {
      const selected = new Set(prev.subjectIds || []);
      if (selected.has(subjectId)) selected.delete(subjectId);
      else selected.add(subjectId);
      return { ...prev, subjectIds: Array.from(selected) };
    });
  };

  const handleCreate = (event) => {
    event.preventDefault();

    if (!form.username.trim() || !form.password.trim() || !form.fullName.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const departmentId = selectedDepartmentId;
    if (!departmentId) {
      alert("Please select a department.");
      return;
    }

    if (targetRole === ROLES.FACULTY && (!form.subjectIds || form.subjectIds.length === 0)) {
      alert("Please assign at least one subject.");
      return;
    }

    if (users.some((user) => user.username === form.username.trim())) {
      alert("Username already exists.");
      return;
    }

    const newUser = {
      id: `${targetRole}-${Date.now()}`,
      username: form.username.trim(),
      password: form.password,
      role: targetRole,
      departmentIds: [departmentId],
      subjectIds: targetRole === ROLES.FACULTY ? form.subjectIds : [],
      profile: {
        fullName: form.fullName.trim(),
        employeeId: form.employeeId.trim(),
        email: form.email.trim(),
        department: getDepartmentNameById(departmentId, departmentId.toUpperCase()),
      },
    };

    const allowed = canCreateUser(currentUser, {
      role: newUser.role,
      departmentIds: newUser.departmentIds,
      subjectIds: newUser.subjectIds,
    });

    if (!allowed) {
      alert("You are not allowed to create this user.");
      return;
    }

    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    writeJSON(STORAGE_KEYS.REGISTERED_USERS, nextUsers);
    setForm((prev) => ({ ...emptyForm, departmentId: isAdmin ? "" : prev.departmentId }));
    alert(`${targetRole.toUpperCase()} account created.`);
  };

  if (!isAdmin && !isHod) {
    return (
      <div className="forms-container">
        <div className="forms-header">
          <h2>User Management</h2>
          <p>You do not have access to this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="forms-container">
      <div className="forms-header">
        <h2>User Management</h2>
        <p>{isAdmin ? "Admin can register HOD accounts." : "HOD can register faculty in their department."}</p>
      </div>

      <form className="subject-form-card" onSubmit={handleCreate}>
        <h3>Create {targetRole.toUpperCase()}</h3>
        <div className="subject-form-grid">
          <input
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="Full Name"
            required
          />
          <input
            value={form.employeeId}
            onChange={(e) => setForm((prev) => ({ ...prev, employeeId: e.target.value }))}
            placeholder={isAdmin ? "HOD Employee ID" : "Faculty Employee ID"}
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
          />
          <input
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Password"
            required
          />
          <select
            value={selectedDepartmentId}
            onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value, subjectIds: [] }))}
            disabled={!isAdmin}
          >
            <option value="">Select Department</option>
            {availableDepartments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {targetRole === ROLES.FACULTY && (
          <div style={{ marginTop: 16 }}>
            <strong>Assign Subjects</strong>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {availableSubjects.map((subject) => (
                <label key={subject.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={(form.subjectIds || []).includes(subject.id)}
                    onChange={() => handleSubjectToggle(subject.id)}
                  />
                  {subject.name} ({subject.code}) - Year {subject.year}
                </label>
              ))}
              {availableSubjects.length === 0 && <p style={{ margin: 0 }}>No subjects available for selected department.</p>}
            </div>
          </div>
        )}

        <div className="faculty-actions">
          <button type="submit" className="btn-primary">
            Create {targetRole.toUpperCase()}
          </button>
        </div>
      </form>

      <div className="subject-cards-grid">
        {createdUsers.map((user) => (
          <article key={user.id} className="subject-card faculty-card">
            <h3>{user.profile?.fullName || user.username}</h3>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Department:</strong> {(user.departmentIds || []).map((id) => getDepartmentNameById(id, id)).join(", ")}</p>
            {user.role === ROLES.FACULTY && (
              <p>
                <strong>Subjects:</strong>{" "}
                {(user.subjectIds || [])
                  .map((subjectId) => {
                    const subject = subjects.find((item) => item.id === subjectId);
                    return subject ? `${subject.name} (${subject.code})` : subjectId;
                  })
                  .join(", ")}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default UserManagement;
