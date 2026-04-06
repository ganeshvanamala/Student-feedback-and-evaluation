import React, { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../auth/session";
import { ROLES } from "../auth/roles";
import { canCreateUser } from "../auth/accessControl";
import { DEPARTMENTS, getDepartmentNameById } from "../utils/departments";
import { getSubjects, initializeAcademicData } from "../utils/academicData";
import { getUsers, registerUser } from "../api/usersApi";

const emptyForm = {
  fullName: "",
  employeeId: "",
  email: "",
  username: "",
  password: "",
  departmentId: "",
  subjectIds: [],
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
};

function UserManagement() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [subjects, setSubjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const load = async () => {
      await initializeAcademicData();
      setCurrentUser(getCurrentUser());
      setSubjects(await getSubjects());
      try {
        setUsers(await getUsers());
      } catch (error) {
        console.error("API FAILED", error);
        setUsers([]);
      }
    };
    load();
  }, []);

  const isAdmin = currentUser.role === ROLES.ADMIN;
  const isHod = currentUser.role === ROLES.HOD;
  const targetRole = isAdmin ? ROLES.HOD : ROLES.FACULTY;

  const isCreatedByCurrentUser = (user) => {
    const createdBy = user?.createdByUserId;
    if (!createdBy) return false;
    return String(createdBy) === String(currentUser.id) || String(createdBy) === String(currentUser.username);
  };

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
    if (isAdmin) {
      return users.filter((user) => String(user.role || "").toLowerCase() === ROLES.HOD);
    }

    if (isHod) {
      return users.filter((user) => String(user.role || "").toLowerCase() === ROLES.FACULTY && isCreatedByCurrentUser(user));
    }

    return [];
  }, [isAdmin, isHod, users]);

  const visibleUsers = useMemo(() => {
    if (isAdmin) {
      return users.filter((user) => String(user.role || "").toLowerCase() !== ROLES.ADMIN);
    }

    if (isHod) {
      return createdUsers;
    }

    return [];
  }, [isAdmin, isHod, users, createdUsers]);

  const handleSubjectToggle = (subjectId) => {
    setForm((prev) => {
      const selected = new Set(prev.subjectIds || []);
      if (selected.has(subjectId)) selected.delete(subjectId);
      else selected.add(subjectId);
      return { ...prev, subjectIds: Array.from(selected) };
    });
  };

  const handleCreate = async (event) => {
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
      username: form.username.trim(),
      password: form.password,
      role: targetRole,
      departmentId,
      departmentIds: [departmentId],
      subjectIds: targetRole === ROLES.FACULTY ? form.subjectIds : [],
      fullName: form.fullName.trim(),
      employeeId: form.employeeId.trim(),
      email: form.email.trim(),
      createdByUserId: String(currentUser.id || currentUser.username || ""),
      createdByRole: String(currentUser.role || ""),
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

    try {
      await registerUser(newUser);
      setUsers(await getUsers());
      setForm((prev) => ({ ...emptyForm, departmentId: isAdmin ? "" : prev.departmentId }));
      alert(`${targetRole.toUpperCase()} account created.`);
    } catch (error) {
      console.error("API FAILED", error);
      alert("Unable to create user.");
    }
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

      <div className="forms-header" style={{ marginTop: 20 }}>
        <h2>{isHod ? "Accounts Created By You" : "Registered Accounts"}</h2>
        <p>Total visible accounts: {visibleUsers.length}</p>
      </div>

      <div className="subject-cards-grid">
        {visibleUsers.map((user) => {
          const role = String(user.role || "").toLowerCase();
          const departmentIds = [...toArray(user.departmentIds), user.departmentId].filter(
            (value, index, arr) => Boolean(value) && arr.indexOf(value) === index
          );
          return (
            <article key={user.id || user.username} className="subject-card faculty-card">
              <h3>{user.fullName || user.username}</h3>
              <p><strong>Role:</strong> {role || "-"}</p>
              <p><strong>Username:</strong> {user.username || "-"}</p>
              <p><strong>Email:</strong> {user.email || "-"}</p>
              <p><strong>Employee ID:</strong> {user.employeeId || "-"}</p>
              <p><strong>Student ID:</strong> {user.studentId || "-"}</p>
              <p><strong>Year:</strong> {user.year || "-"}</p>
              <p>
                <strong>Department:</strong>{" "}
                {departmentIds.length ? departmentIds.map((id) => getDepartmentNameById(id, id)).join(", ") : "-"}
              </p>
              {role === ROLES.FACULTY && (
                <p>
                  <strong>Subjects:</strong>{" "}
                  {(user.subjectIds || [])
                    .map((subjectId) => {
                      const subject = subjects.find((item) => item.id === subjectId);
                      return subject ? `${subject.name} (${subject.code})` : subjectId;
                    })
                    .join(", ") || "-"}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default UserManagement;
