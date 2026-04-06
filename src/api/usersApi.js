import { API_BASE_URL } from "./baseUrl";

const USERS_BASE = `${API_BASE_URL}/api/users`;

const parseApiData = async (response, endpointLabel) => {
  const data = await response.json();
  console.log("[USERS] Parsed response", data);

  if (!response.ok) {
    throw new Error(`${endpointLabel} failed with status ${response.status}`);
  }

  if (data && typeof data === "object" && data.error) {
    throw new Error(String(data.error));
  }

  return data;
};

export const registerUser = async (payload) => {
  try {
    console.log("[USERS] Sending request", { method: "POST", url: `${USERS_BASE}/register`, body: payload });
    const response = await fetch(`${USERS_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("[USERS] Response received", {
      endpoint: `${USERS_BASE}/register`,
      status: response.status,
      ok: response.ok,
    });

    return await parseApiData(response, "POST /api/users/register");
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const loginUser = async (payload) => {
  try {
    console.log("[USERS] Sending request", { method: "POST", url: `${USERS_BASE}/login`, body: payload });
    const response = await fetch(`${USERS_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("[USERS] Response received", {
      endpoint: `${USERS_BASE}/login`,
      status: response.status,
      ok: response.ok,
    });

    return await parseApiData(response, "POST /api/users/login");
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const updatePassword = async (payload) => {
  try {
    console.log("[USERS] Sending request", { method: "POST", url: `${USERS_BASE}/password`, body: payload });
    const response = await fetch(`${USERS_BASE}/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("[USERS] Response received", {
      endpoint: `${USERS_BASE}/password`,
      status: response.status,
      ok: response.ok,
    });

    return await parseApiData(response, "POST /api/users/password");
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    console.log("[USERS] Sending request", { method: "GET", url: USERS_BASE });
    const response = await fetch(USERS_BASE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("[USERS] Response received", {
      endpoint: USERS_BASE,
      status: response.status,
      ok: response.ok,
    });

    const data = await parseApiData(response, "GET /api/users");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};