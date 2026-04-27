import { API_BASE_URL } from "./baseUrl";
import { requestJson } from "./httpClient";

const AUTH_BASE = `${API_BASE_URL}/api/auth`;

export const forgotPassword = (payload) =>
  requestJson(`${AUTH_BASE}/forgot-password`, {
    method: "POST",
    body: payload,
    requireAuth: false,
  });

export const resetPassword = (payload) =>
  requestJson(`${AUTH_BASE}/reset-password`, {
    method: "POST",
    body: payload,
    requireAuth: false,
  });

export const googleLogin = (token) =>
  requestJson(`${AUTH_BASE}/google-login`, {
    method: "POST",
    body: { token },
    requireAuth: false,
  });

export const completeGoogleProfile = (payload) =>
  requestJson(`${AUTH_BASE}/google-complete-profile`, {
    method: "POST",
    body: payload,
  });
