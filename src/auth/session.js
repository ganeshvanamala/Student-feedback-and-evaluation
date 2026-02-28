import { ROLES, normalizeRole } from "./roles";
import { inferDepartmentId } from "../utils/departments";

const SESSION_KEY = "authSession";
const USERS_KEY = "registeredUsers";
const LEGACY_STUDENT_KEY = "currentStudent";

const defaultSession = Object.freeze({
  isAuthenticated: false,
  user: {
    id: null,
    username: "",
    role: ROLES.GUEST,
    departmentIds: [],
    subjectIds: [],
    facultyId: null,
    studentId: null,
    permissions: [],
  },
});

function safeReadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function normalizeDepartmentIds(value) {
  return normalizeArray(value)
    .map((item) => inferDepartmentId(item))
    .filter((item, index, arr) => Boolean(item) && arr.indexOf(item) === index);
}

function normalizeUser(rawUser = {}) {
  return {
    id: rawUser.id || rawUser.userId || rawUser.username || null,
    username: rawUser.username || "",
    role: normalizeRole(rawUser.role),
    departmentIds: normalizeDepartmentIds(rawUser.departmentIds || rawUser.departmentId),
    subjectIds: normalizeArray(rawUser.subjectIds || rawUser.subjectId),
    facultyId: rawUser.facultyId || null,
    studentId: rawUser.studentId || rawUser.profile?.studentId || null,
    permissions: normalizeArray(rawUser.permissions),
    profile: rawUser.profile || null,
  };
}

function buildSession(user, isAuthenticated = true) {
  return {
    isAuthenticated: Boolean(isAuthenticated),
    user: normalizeUser(user),
  };
}

function readLegacyStudentSession() {
  const username = localStorage.getItem(LEGACY_STUDENT_KEY);
  if (!username) return null;

  const users = safeReadJSON(USERS_KEY, []);
  const matched = users.find((item) => item?.username === username);

  return buildSession(
    {
      ...matched,
      username,
      role: ROLES.STUDENT,
      studentId: matched?.profile?.studentId || null,
      departmentIds: normalizeDepartmentIds(matched?.profile?.department),
    },
    true
  );
}

export function getSession() {
  const stored = safeReadJSON(SESSION_KEY, null);
  if (stored?.user?.role) return buildSession(stored.user, stored.isAuthenticated !== false);

  const legacyStudent = readLegacyStudentSession();
  if (legacyStudent) return legacyStudent;

  return { ...defaultSession };
}

export function getCurrentUser() {
  return getSession().user;
}

export function isAuthenticated() {
  return getSession().isAuthenticated;
}

export function setSession(user) {
  const session = buildSession(user, true);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  // Keep current student key synchronized for backward compatibility.
  if (session.user.role === ROLES.STUDENT && session.user.username) {
    localStorage.setItem(LEGACY_STUDENT_KEY, session.user.username);
  }

  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_STUDENT_KEY);
}

export const AUTH_KEYS = Object.freeze({
  SESSION_KEY,
  USERS_KEY,
  LEGACY_STUDENT_KEY,
});
