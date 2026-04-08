import { ROLES, normalizeRole } from "./roles";
import { inferDepartmentId } from "../utils/departments";

const emptyUser = {
  id: null,
  username: "",
  role: ROLES.GUEST,
  departmentIds: [],
  subjectIds: [],
  facultyId: null,
  studentId: null,
  permissions: [],
  profile: null,
  password: null,
};

export const AUTH_KEYS = Object.freeze({
  SESSION_KEY: "authSession",
  USERS_KEY: "apiUsers",
  LEGACY_STUDENT_KEY: "apiCurrentUser",
});

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === "") return [];
  return [value];
};

const normalizeDepartmentIds = (value) =>
  normalizeArray(value)
    .map((item) => inferDepartmentId(item))
    .filter((item, index, arr) => Boolean(item) && arr.indexOf(item) === index);

const normalizeUser = (rawUser = {}) => ({
  id: rawUser.id || rawUser.userId || rawUser.username || null,
  username: rawUser.username || "",
  role: normalizeRole(rawUser.role),
  departmentIds: normalizeDepartmentIds(rawUser.departmentIds || rawUser.departmentId),
  subjectIds: normalizeArray(rawUser.subjectIds || rawUser.subjectId),
  facultyId: rawUser.facultyId || null,
  studentId: rawUser.studentId || rawUser.profile?.studentId || null,
  permissions: normalizeArray(rawUser.permissions),
  profile: rawUser.profile || null,
  password: rawUser.password || null,
});

const buildSession = (user, isAuthenticated = true) => ({
  isAuthenticated: Boolean(isAuthenticated),
  user: normalizeUser(user),
});

const canUseStorage = () => typeof window !== "undefined" && !!window.localStorage;

const persistSession = (session) => {
  if (!canUseStorage()) return;
  try {
    const toPersist = {
      isAuthenticated: Boolean(session?.isAuthenticated),
      user: {
        ...normalizeUser(session?.user || {}),
        password: null,
      },
    };
    localStorage.setItem(AUTH_KEYS.SESSION_KEY, JSON.stringify(toPersist));
  } catch (error) {
    console.error("API FAILED", error);
  }
};

const readPersistedSession = () => {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(AUTH_KEYS.SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.isAuthenticated || !parsed.user) return null;
    return buildSession({ ...parsed.user, password: null }, true);
  } catch (error) {
    console.error("API FAILED", error);
    return null;
  }
};

let inMemorySession = readPersistedSession() || {
  isAuthenticated: false,
  user: { ...emptyUser },
};

export function getSession() {
  return inMemorySession;
}

export function getCurrentUser() {
  return inMemorySession.user;
}

export function isAuthenticated() {
  return inMemorySession.isAuthenticated;
}

export function setSession(user) {
  inMemorySession = buildSession(user, true);
  persistSession(inMemorySession);
  return inMemorySession;
}

export function clearSession() {
  inMemorySession = {
    isAuthenticated: false,
    user: { ...emptyUser },
  };

  if (canUseStorage()) {
    try {
      localStorage.removeItem(AUTH_KEYS.SESSION_KEY);
    } catch (error) {
      console.error("API FAILED", error);
    }
  }
}
