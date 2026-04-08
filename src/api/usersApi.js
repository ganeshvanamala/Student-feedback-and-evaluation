import { API_BASE_URL } from "./baseUrl";
import { requestJson } from "./httpClient";

const USERS_BASE = `${API_BASE_URL}/api/users`;

export const registerUser = async (payload) =>
  requestJson(`${USERS_BASE}/register`, {
    method: "POST",
    body: payload,
    requireAuth: false,
  });

export const loginUser = async (payload) =>
  requestJson(`${USERS_BASE}/login`, {
    method: "POST",
    body: payload,
    requireAuth: false,
  });

export const logoutUser = async () =>
  requestJson(`${USERS_BASE}/logout`, {
    method: "POST",
    body: {},
  });

export const updatePassword = async (payload) =>
  requestJson(`${USERS_BASE}/password`, {
    method: "POST",
    body: payload,
  });

export const getUsers = async () => {
  const data = await requestJson(USERS_BASE, {
    method: "GET",
  });
  return Array.isArray(data) ? data : [];
};
