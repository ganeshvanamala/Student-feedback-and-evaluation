import { API_BASE_URL } from "./baseUrl";
const REPLIES_API_URL = `${API_BASE_URL}/api/replies`;

export const fetchReplies = async (targetUser = "") => {
  try {
    const query = targetUser ? `?targetUser=${encodeURIComponent(targetUser)}` : "";
    const url = `${REPLIES_API_URL}${query}`;
    console.log("[REPLIES] Sending request", { method: "GET", url });
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    console.log("[REPLIES] Response received", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error(`GET /api/replies failed with status ${response.status}`);
    const data = await response.json();
    console.log("[REPLIES] Parsed response", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const createReply = async (payload) => {
  try {
    console.log("[REPLIES] Sending request", { method: "POST", url: REPLIES_API_URL, body: payload });
    const response = await fetch(REPLIES_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("[REPLIES] Response received", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error(`POST /api/replies failed with status ${response.status}`);
    const data = await response.json();
    console.log("[REPLIES] Parsed response", data);
    return data;
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const markRepliesRead = async (targetUser) => {
  try {
    const url = `${REPLIES_API_URL}/mark-read/${encodeURIComponent(targetUser)}`;
    console.log("[REPLIES] Sending request", { method: "PUT", url });
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    console.log("[REPLIES] Response received", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error(`PUT /api/replies/mark-read/${targetUser} failed with status ${response.status}`);
    const data = await response.json();
    console.log("[REPLIES] Parsed response", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

