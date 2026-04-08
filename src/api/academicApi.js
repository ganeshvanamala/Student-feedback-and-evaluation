import { API_BASE_URL } from "./baseUrl";
import { requestJson } from "./httpClient";

const SUBJECTS_API = `${API_BASE_URL}/api/subjects`;
const FACULTY_API = `${API_BASE_URL}/api/faculty`;

export const fetchSubjects = async () => {
  const data = await requestJson(SUBJECTS_API, { method: "GET" });
  return Array.isArray(data) ? data : [];
};

export const saveSubject = async (subject) =>
  requestJson(SUBJECTS_API, {
    method: "POST",
    body: subject,
  });

export const deleteSubject = async (subjectId) =>
  requestJson(`${SUBJECTS_API}/${encodeURIComponent(subjectId)}`, {
    method: "DELETE",
  });

export const fetchFaculty = async () => {
  const data = await requestJson(FACULTY_API, { method: "GET" });
  return Array.isArray(data) ? data : [];
};

export const saveFacultyMember = async (faculty) =>
  requestJson(FACULTY_API, {
    method: "POST",
    body: faculty,
  });

export const deleteFacultyMember = async (facultyId) =>
  requestJson(`${FACULTY_API}/${encodeURIComponent(facultyId)}`, {
    method: "DELETE",
  });
