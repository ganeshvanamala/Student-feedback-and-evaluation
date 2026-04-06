import { API_BASE_URL } from "./baseUrl";
const BLOCKS_API_URL = `${API_BASE_URL}/api/complaint-block-list`;

const normalize = (data) => ({
  academics: Array.isArray(data?.academics) ? data.academics : [],
  sports: Array.isArray(data?.sports) ? data.sports : [],
  hostel: Array.isArray(data?.hostel) ? data.hostel : [],
  categoryBlocked: data?.categoryBlocked && typeof data.categoryBlocked === "object" ? data.categoryBlocked : {},
});

export const fetchComplaintBlockList = async () => {
  try {
    console.log("[BLOCKS] Sending request", { method: "GET", url: BLOCKS_API_URL });
    const response = await fetch(BLOCKS_API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    console.log("[BLOCKS] Response received", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error(`GET /api/complaint-block-list failed with status ${response.status}`);
    const data = await response.json();
    console.log("[BLOCKS] Parsed response", data);
    return normalize(data);
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const saveComplaintBlockList = async (payload) => {
  try {
    const body = normalize(payload);
    console.log("[BLOCKS] Sending request", { method: "PUT", url: BLOCKS_API_URL, body });
    const response = await fetch(BLOCKS_API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    console.log("[BLOCKS] Response received", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error(`PUT /api/complaint-block-list failed with status ${response.status}`);
    const data = await response.json();
    console.log("[BLOCKS] Parsed response", data);
    return normalize(data);
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

