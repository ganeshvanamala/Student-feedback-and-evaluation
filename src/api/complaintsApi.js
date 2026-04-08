import { API_BASE_URL } from "./baseUrl";
import { requestJson } from "./httpClient";

const COMPLAINTS_API_URL = `${API_BASE_URL}/api/complaints`;

export const fetchComplaints = async () => {
  const data = await requestJson(COMPLAINTS_API_URL, { method: "GET" });
  return Array.isArray(data) ? data : [];
};

export const createComplaint = async (payload) =>
  requestJson(COMPLAINTS_API_URL, {
    method: "POST",
    body: payload,
  });

export const deleteComplaint = async (id) =>
  requestJson(`${COMPLAINTS_API_URL}/${id}`, {
    method: "DELETE",
  });

export const setComplaintPlagged = async (id, value = true) =>
  requestJson(`${COMPLAINTS_API_URL}/${id}/plagged?value=${value}`, {
    method: "PUT",
  });
