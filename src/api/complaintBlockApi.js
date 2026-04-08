import { API_BASE_URL } from "./baseUrl";
import { requestJson } from "./httpClient";

const BLOCKS_API_URL = `${API_BASE_URL}/api/complaint-block-list`;

const normalize = (data) => ({
  academics: Array.isArray(data?.academics) ? data.academics : [],
  sports: Array.isArray(data?.sports) ? data.sports : [],
  hostel: Array.isArray(data?.hostel) ? data.hostel : [],
  categoryBlocked: data?.categoryBlocked && typeof data.categoryBlocked === "object" ? data.categoryBlocked : {},
});

export const fetchComplaintBlockList = async () => {
  const data = await requestJson(BLOCKS_API_URL, { method: "GET" });
  return normalize(data);
};

export const saveComplaintBlockList = async (payload) => {
  const data = await requestJson(BLOCKS_API_URL, {
    method: "PUT",
    body: normalize(payload),
  });
  return normalize(data);
};
