import { fetchFaculty, fetchSubjects, saveFacultyMember, saveSubject, deleteFacultyMember, deleteSubject } from "../api/academicApi";
import { getDepartmentNameById, inferDepartmentId } from "./departments";

export const BTECH_BRANCHES = ["CSE", "ECE", "EEE", "MECHANICAL", "CIVIL"];
export const BTECH_YEARS = [1, 2, 3, 4];
export const SECTION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const withSubjectDepartment = (subject) => {
  const departmentId = inferDepartmentId(subject?.departmentId || subject?.branch);
  return {
    ...subject,
    departmentId,
    branch: subject?.branch || getDepartmentNameById(departmentId, ""),
  };
};

const withFacultyDepartment = (faculty) => {
  const departmentId = inferDepartmentId(faculty?.departmentId || faculty?.branch);
  return {
    ...faculty,
    departmentId,
    branch: faculty?.branch || getDepartmentNameById(departmentId, ""),
  };
};

export const initializeAcademicData = async () => {
  return Promise.resolve();
};

export const getSubjects = async () => {
  const subjects = await fetchSubjects();
  return subjects.map(withSubjectDepartment);
};

export const getFaculty = async () => {
  const faculty = await fetchFaculty();
  return faculty.map(withFacultyDepartment);
};

export const saveSubjects = async (subjects) => {
  const next = Array.isArray(subjects) ? subjects : [];
  const existing = await fetchSubjects();
  const existingIds = new Set(existing.map((item) => item.id));
  const nextIds = new Set(next.map((item) => item.id));

  for (const subject of next) {
    await saveSubject(withSubjectDepartment(subject));
  }

  for (const subjectId of existingIds) {
    if (!nextIds.has(subjectId)) {
      await deleteSubject(subjectId);
    }
  }
};

export const saveFaculty = async (faculty) => {
  const next = Array.isArray(faculty) ? faculty : [];
  const existing = await fetchFaculty();
  const existingIds = new Set(existing.map((item) => item.id));
  const nextIds = new Set(next.map((item) => item.id));

  for (const member of next) {
    await saveFacultyMember(withFacultyDepartment(member));
  }

  for (const facultyId of existingIds) {
    if (!nextIds.has(facultyId)) {
      await deleteFacultyMember(facultyId);
    }
  }
};

export const removeSubjectFromFaculty = async (subjectId) => {
  const faculty = await fetchFaculty();
  const updated = faculty.map((item) => ({
    ...item,
    teaching: (item.teaching || []).filter((entry) => entry.subjectId !== subjectId),
  }));
  await saveFaculty(updated);
};
