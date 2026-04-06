import { API_BASE_URL } from "./baseUrl";
const SUBJECTS_API = `${API_BASE_URL}/api/subjects`;
const FACULTY_API = `${API_BASE_URL}/api/faculty`;

const request = async (url, options) => {
  try {
    console.log("[ACADEMIC] Sending request", { url, ...(options || {}) });
    const response = await fetch(url, options);
    console.log("[ACADEMIC] Response received", { url, status: response.status, ok: response.ok });
    if (!response.ok) throw new Error(`API failed with status ${response.status}`);
    if (response.status === 204) return null;
    const data = await response.json();
    console.log("[ACADEMIC] Parsed response", data);
    return data;
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const fetchSubjects = async () => {
  const data = await request(SUBJECTS_API, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return Array.isArray(data) ? data : [];
};

export const saveSubject = async (subject) =>
  request(SUBJECTS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subject),
  });

export const deleteSubject = async (subjectId) =>
  request(`${SUBJECTS_API}/${encodeURIComponent(subjectId)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

export const fetchFaculty = async () => {
  const data = await request(FACULTY_API, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return Array.isArray(data) ? data : [];
};

export const saveFacultyMember = async (faculty) =>
  request(FACULTY_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(faculty),
  });

export const deleteFacultyMember = async (facultyId) =>
  request(`${FACULTY_API}/${encodeURIComponent(facultyId)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

