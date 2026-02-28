export const ROLES = Object.freeze({
  ADMIN: "admin",
  HOD: "hod",
  FACULTY: "faculty",
  STUDENT: "student",
  GUEST: "guest",
});

const ROLE_ALIASES = Object.freeze({
  admin: ROLES.ADMIN,
  administrator: ROLES.ADMIN,
  hod: ROLES.HOD,
  head_of_department: ROLES.HOD,
  faculty: ROLES.FACULTY,
  teacher: ROLES.FACULTY,
  staff: ROLES.FACULTY,
  student: ROLES.STUDENT,
  guest: ROLES.GUEST,
});

export const ROLE_PRIORITY = Object.freeze({
  [ROLES.GUEST]: 0,
  [ROLES.STUDENT]: 1,
  [ROLES.FACULTY]: 2,
  [ROLES.HOD]: 3,
  [ROLES.ADMIN]: 4,
});

export const ROLE_HIERARCHY = Object.freeze({
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY, ROLES.STUDENT, ROLES.GUEST],
  [ROLES.HOD]: [ROLES.HOD, ROLES.FACULTY, ROLES.STUDENT, ROLES.GUEST],
  [ROLES.FACULTY]: [ROLES.FACULTY, ROLES.STUDENT, ROLES.GUEST],
  [ROLES.STUDENT]: [ROLES.STUDENT, ROLES.GUEST],
  [ROLES.GUEST]: [ROLES.GUEST],
});

export function normalizeRole(value) {
  if (!value) return ROLES.GUEST;
  const normalized = String(value).trim().toLowerCase();
  return ROLE_ALIASES[normalized] || ROLES.GUEST;
}

export function isRoleAtLeast(userRole, minimumRole) {
  return (ROLE_PRIORITY[normalizeRole(userRole)] || 0) >= (ROLE_PRIORITY[normalizeRole(minimumRole)] || 0);
}

export function hasAnyRole(userRole, allowedRoles = []) {
  const normalizedUserRole = normalizeRole(userRole);
  return allowedRoles.map(normalizeRole).includes(normalizedUserRole);
}
