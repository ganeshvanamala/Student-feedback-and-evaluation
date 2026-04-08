const API = "http://localhost:8080";

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
};

export const forgotPassword = (payload) => postJson(`${API}/api/auth/forgot-password`, payload);

export const resetPassword = (payload) => postJson(`${API}/api/auth/reset-password`, payload);

export const googleLogin = (token) => postJson(`${API}/api/auth/google-login`, { token });

export const completeGoogleProfile = (payload) => postJson(`${API}/api/auth/google-complete-profile`, payload);
