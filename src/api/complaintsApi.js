import { API_BASE_URL } from "./baseUrl";
const COMPLAINTS_API_URL = `${API_BASE_URL}/api/complaints`;

export const fetchComplaints = async () => {
  try {
    console.log("[COMPLAINTS] Sending request", { method: "GET", url: COMPLAINTS_API_URL });
    const response = await fetch(COMPLAINTS_API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    console.log("[COMPLAINTS] Response received", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error(`GET /api/complaints failed with status ${response.status}`);
    const data = await response.json();
    console.log("[COMPLAINTS] Parsed response", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const createComplaint = async (payload) => {
  try {
    console.log("[COMPLAINTS] Sending request", { method: "POST", url: COMPLAINTS_API_URL, body: payload });
    const response = await fetch(COMPLAINTS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("[COMPLAINTS] Response received", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error(`POST /api/complaints failed with status ${response.status}`);
    const data = await response.json();
    console.log("[COMPLAINTS] Parsed response", data);
    return data;
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const deleteComplaint = async (id) => {
  try {
    const url = `${COMPLAINTS_API_URL}/${id}`;
    console.log("[COMPLAINTS] Sending request", { method: "DELETE", url });
    const response = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    console.log("[COMPLAINTS] Response received", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error(`DELETE /api/complaints/${id} failed with status ${response.status}`);
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const setComplaintPlagged = async (id, value = true) => {
  try {
    const url = `${COMPLAINTS_API_URL}/${id}/plagged?value=${value}`;
    console.log("[COMPLAINTS] Sending request", { method: "PUT", url });
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    console.log("[COMPLAINTS] Response received", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error(`PUT /api/complaints/${id}/plagged failed with status ${response.status}`);
    const data = await response.json();
    console.log("[COMPLAINTS] Parsed response", data);
    return data;
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

