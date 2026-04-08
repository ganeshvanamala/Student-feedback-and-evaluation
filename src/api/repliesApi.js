import { API_BASE_URL } from "./baseUrl";
import { requestJson } from "./httpClient";

const REPLIES_API_URL = `${API_BASE_URL}/api/replies`;

export const fetchReplies = async (targetUser = "") => {
  const query = targetUser ? `?targetUser=${encodeURIComponent(targetUser)}` : "";
  const data = await requestJson(`${REPLIES_API_URL}${query}`, { method: "GET" });
  return Array.isArray(data) ? data : [];
};

export const createReply = async (payload) =>
  requestJson(REPLIES_API_URL, {
    method: "POST",
    body: payload,
  });

export const markRepliesRead = async (targetUser) => {
  const data = await requestJson(`${REPLIES_API_URL}/mark-read/${encodeURIComponent(targetUser)}`, {
    method: "PUT",
  });
  return Array.isArray(data) ? data : [];
};
