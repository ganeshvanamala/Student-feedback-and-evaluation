import { clearSession, getAuthToken, isSessionExpired } from "../auth/session";

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text || null;
  }
  return response.json();
};

export const requestJson = async (url, options = {}) => {
  const { method = "GET", body, headers = {}, requireAuth = true } = options;
  const requestHeaders = { "Content-Type": "application/json", ...headers };

  if (requireAuth) {
    if (isSessionExpired()) {
      clearSession();
      throw new Error("Session expired. Please login again.");
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required. Please login.");
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const parsed = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      (parsed && typeof parsed === "object" && (parsed.error || parsed.message)) ||
      `Request failed with status ${response.status}`;
    throw new Error(String(message));
  }

  return parsed;
};
