function hasLocalStorage() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function readRaw(key, fallback = null) {
  if (!hasLocalStorage()) return fallback;
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

export function writeRaw(key, value) {
  if (!hasLocalStorage()) return false;
  try {
    localStorage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  if (!hasLocalStorage()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function safeParse(key, fallback = null) {
  const value = readRaw(key, null);
  if (value === null || value === undefined || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function readJSON(key, fallback = null) {
  return safeParse(key, fallback);
}

export function writeJSON(key, value) {
  if (!hasLocalStorage()) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function updateJSON(key, updater, fallback = null) {
  const current = readJSON(key, fallback);
  const next = updater(current);
  writeJSON(key, next);
  return next;
}

export function ensureJSON(key, fallbackValue) {
  const existing = readJSON(key, undefined);
  if (existing !== undefined) return existing;
  writeJSON(key, fallbackValue);
  return fallbackValue;
}
