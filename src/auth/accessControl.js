import { ROLES, hasAnyRole, normalizeRole } from "./roles";
import { inferDepartmentId } from "../utils/departments";
import { getSubjects } from "../utils/academicData";

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function normalizeUser(user = {}) {
  return {
    ...user,
    role: normalizeRole(user.role),
    departmentIds: toArray(user.departmentIds || user.departmentId),
    subjectIds: toArray(user.subjectIds || user.subjectId),
  };
}

function getResourceDepartments(resource = {}) {
  const raw = toArray(
    resource.departmentIds ||
      resource.departmentId ||
      resource.targetDepartmentIds ||
      resource.targetDepartmentId ||
      resource.targetBranch ||
      resource.dept
  );
  return raw
    .map((value) => inferDepartmentId(value))
    .filter((value, index, arr) => Boolean(value) && arr.indexOf(value) === index);
}

function getResourceSubjects(resource = {}) {
  return toArray(resource.subjectIds || resource.subjectId || resource.targetSubjectIds || resource.targetSubjectId);
}

function hasDepartmentScope(user, departmentId) {
  if (!departmentId) return false;
  const u = normalizeUser(user);
  if (u.role === ROLES.ADMIN) return true;
  const targetDepartmentId = inferDepartmentId(departmentId);
  return u.departmentIds
    .map((id) => inferDepartmentId(id))
    .filter(Boolean)
    .includes(targetDepartmentId);
}

function hasSubjectScope(user, subjectId) {
  if (!subjectId) return false;
  const u = normalizeUser(user);
  if (u.role === ROLES.ADMIN) return true;
  return u.subjectIds.includes(subjectId);
}

function matchesLegacyAcademicEligibility(form = {}, context = {}) {
  if (form.category !== "academics") return true;

  if (form.sendToAll !== false) return true;

  const targetYear = Number(form.targetYear || 0);
  const studentYear = Number(context.year || 0);
  if (targetYear > 0 && targetYear !== studentYear) return false;

  if (!form.targetSubjectId && !form.targetSubjectCode && !form.targetSubjectName) return false;

  const byId = !!form.targetSubjectId && context.subjectId === form.targetSubjectId;
  const byCode =
    !!form.targetSubjectCode &&
    !!context.courseCode &&
    String(context.courseCode).toUpperCase() === String(form.targetSubjectCode).toUpperCase();
  const byName =
    !!form.targetSubjectName &&
    !!context.course &&
    String(context.course).trim().toLowerCase() === String(form.targetSubjectName).trim().toLowerCase();

  return byId || byCode || byName;
}

function evaluateScopeVisibility(user, resource = {}) {
  const u = normalizeUser(user);
  if (u.role === ROLES.ADMIN) return true;

  const scopeType = (resource.scopeType || resource.visibilityScopeType || "").toLowerCase();
  const scopeIds = toArray(resource.scopeIds || resource.visibilityScopeIds);

  if (!scopeType) return false;
  if (!scopeIds.length) return false;

  if (scopeType === "institution") return u.role === ROLES.ADMIN;
  if (scopeType === "department") return scopeIds.some((id) => hasDepartmentScope(u, id));
  if (scopeType === "subject") return scopeIds.some((id) => hasSubjectScope(u, id));
  if (scopeType === "personal") return scopeIds.includes(u.id) || scopeIds.includes(u.username);

  return false;
}

export function canAccessRoute(user, allowedRoles = []) {
  if (!allowedRoles.length) return true;
  return hasAnyRole(normalizeUser(user).role, allowedRoles);
}

export function canCreateForm(user, target = {}) {
  const u = normalizeUser(user);
  const scopeType = (target.scopeType || "").toLowerCase();
  const scopeIds = toArray(target.scopeIds);
  const targetDepartments = getResourceDepartments(target);

  if (u.role === ROLES.ADMIN) return true;

  if (u.role === ROLES.HOD) {
    if (!["department", "subject"].includes(scopeType)) return false;
    if (!scopeIds.length) return false;
    if (scopeType === "department") return scopeIds.every((id) => hasDepartmentScope(u, id));
    const subjectDepartmentIds = getSubjects()
      .filter((subject) => scopeIds.includes(subject.id))
      .map((subject) => inferDepartmentId(subject.departmentId || subject.branch))
      .filter((value, index, arr) => Boolean(value) && arr.indexOf(value) === index);
    if (subjectDepartmentIds.length) {
      return subjectDepartmentIds.every((id) => hasDepartmentScope(u, id));
    }
    if (targetDepartments.length) {
      return targetDepartments.every((id) => hasDepartmentScope(u, id));
    }
    return scopeIds.every((subjectId) => hasSubjectScope(u, subjectId));
  }

  if (u.role === ROLES.FACULTY) {
    if (scopeType !== "subject") return false;
    if (!scopeIds.length) return false;
    return scopeIds.every((id) => hasSubjectScope(u, id));
  }

  return false;
}

export function canViewForm(user, form = {}, context = {}) {
  const u = normalizeUser(user);
  if (u.role === ROLES.ADMIN) return true;

  if (form.createdBy && String(form.createdBy) === String(u.id)) return true;
  if (form.createdByUserId && String(form.createdByUserId) === String(u.id)) return true;

  if (evaluateScopeVisibility(u, form)) return true;

  const resourceDepartments = getResourceDepartments(form);
  const resourceSubjects = getResourceSubjects(form);

  if (u.role === ROLES.HOD) {
    return (
      resourceDepartments.some((id) => hasDepartmentScope(u, id)) ||
      resourceSubjects.some((id) => hasSubjectScope(u, id))
    );
  }

  if (u.role === ROLES.FACULTY) {
    return resourceSubjects.some((id) => hasSubjectScope(u, id));
  }

  if (u.role === ROLES.STUDENT) {
    // Backward compatibility for current form targeting model.
    if (!form.scopeType && !form.visibilityScopeType) {
      return matchesLegacyAcademicEligibility(form, context);
    }

    if (resourceSubjects.length > 0 && context?.subjectId) {
      return resourceSubjects.includes(context.subjectId);
    }
    if (resourceDepartments.length > 0 && context?.departmentId) {
      return resourceDepartments.includes(context.departmentId);
    }
    return evaluateScopeVisibility(u, form);
  }

  return false;
}

export function canViewResponse(user, response = {}) {
  const u = normalizeUser(user);
  if (u.role === ROLES.ADMIN) return true;

  const responseUser = response.submittedByUserId || response.submittedBy;
  if (u.role === ROLES.STUDENT) {
    return String(responseUser) === String(u.id) || String(responseUser) === String(u.username);
  }

  const responseDeptIds = getResourceDepartments(response);
  const responseSubjectIds = getResourceSubjects(response);

  if (u.role === ROLES.HOD) {
    return responseDeptIds.some((id) => hasDepartmentScope(u, id)) || responseSubjectIds.some((id) => hasSubjectScope(u, id));
  }

  if (u.role === ROLES.FACULTY) {
    return responseSubjectIds.some((id) => hasSubjectScope(u, id));
  }

  return false;
}

export function canViewComplaint(user, complaint = {}) {
  const u = normalizeUser(user);
  if (u.role === ROLES.ADMIN) return true;

  if (u.role === ROLES.STUDENT) {
    const owner = complaint.submittedByUserId || complaint.submittedBy;
    return String(owner) === String(u.id) || String(owner) === String(u.username);
  }

  const complaintDeptId = complaint.departmentId || complaint.dept;
  const complaintSubjectId = complaint.subjectId;

  if (u.role === ROLES.HOD) {
    return hasDepartmentScope(u, complaintDeptId) || hasSubjectScope(u, complaintSubjectId);
  }

  if (u.role === ROLES.FACULTY) {
    return hasSubjectScope(u, complaintSubjectId);
  }

  return false;
}

export function canCreateUser(actor, target = {}) {
  const user = normalizeUser(actor);
  const targetRole = normalizeRole(target.role);
  const targetDepartmentIds = getResourceDepartments(target);

  if (user.role === ROLES.ADMIN) {
    return targetRole === ROLES.HOD;
  }

  if (user.role === ROLES.HOD) {
    if (targetRole !== ROLES.FACULTY) return false;
    if (!targetDepartmentIds.length) return false;
    return targetDepartmentIds.every((departmentId) => hasDepartmentScope(user, departmentId));
  }

  return false;
}
