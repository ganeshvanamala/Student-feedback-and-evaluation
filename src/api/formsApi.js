import { API_BASE_URL } from "./baseUrl";
import { requestJson } from "./httpClient";

const FORMS_API_URL = `${API_BASE_URL}/api/forms`;

export const normalizeFormsByCategory = (formsArray) => {
  const grouped = {
    academics: [],
    sports: [],
    hostel: [],
  };

  if (!Array.isArray(formsArray)) return grouped;

  formsArray.forEach((form) => {
    const category = form?.category;
    if (!grouped[category]) return;
    grouped[category].push(form);
  });

  return grouped;
};

export const fetchFormsByCategory = async () => {
  const forms = await requestJson(FORMS_API_URL, { method: "GET" });
  return normalizeFormsByCategory(forms);
};

export const postForm = async (form) =>
  requestJson(FORMS_API_URL, {
    method: "POST",
    body: form,
  });

export const appendFormResponse = async (formId, responsePayload) =>
  requestJson(`${FORMS_API_URL}/${formId}/responses`, {
    method: "PUT",
    body: responsePayload,
  });

export const deleteFormById = async (formId) =>
  requestJson(`${FORMS_API_URL}/${encodeURIComponent(formId)}`, {
    method: "DELETE",
  });
