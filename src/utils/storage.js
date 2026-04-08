export function hasStorage() {
  return false;
}

export function readStorage() {
  return null;
}

export function writeStorage() {
  return false;
}

export function removeStorage() {
  return false;
}

export function safeParse(_key, fallback = null) {
  return fallback;
}

export function readJSON(_key, fallback = null) {
  return fallback;
}

export function writeJSON() {
  return false;
}

export function updateJSON(_key, updater, fallback = null) {
  return updater(fallback);
}

export function ensureJSON(_key, fallbackValue) {
  return fallbackValue;
}
