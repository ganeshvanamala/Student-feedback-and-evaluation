import { getDepartmentNameById, inferDepartmentId } from "./departments";

const SUBJECTS_KEY = "btechSubjects";
const FACULTY_KEY = "btechFaculty";

export const BTECH_BRANCHES = ["CSE", "ECE", "EEE", "MECHANICAL", "CIVIL"];
export const BTECH_YEARS = [1, 2, 3, 4];
export const SECTION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const defaultSubjects = [
  { id: "sub-1", name: "Engineering Mathematics-I", code: "MA101", branch: "CSE", departmentId: "cse", year: 1 },
  { id: "sub-2", name: "Programming in C", code: "CS102", branch: "CSE", departmentId: "cse", year: 1 },
  { id: "sub-3", name: "Data Structures", code: "CS201", branch: "CSE", departmentId: "cse", year: 2 },
  { id: "sub-4", name: "Database Management Systems", code: "CS301", branch: "CSE", departmentId: "cse", year: 3 },
  { id: "sub-5", name: "Digital Logic Design", code: "EC201", branch: "ECE", departmentId: "ece", year: 2 },
  { id: "sub-6", name: "Signals and Systems", code: "EC202", branch: "ECE", departmentId: "ece", year: 2 },
  { id: "sub-7", name: "Power Systems-I", code: "EE301", branch: "EEE", departmentId: "eee", year: 3 },
  { id: "sub-8", name: "Electrical Machines", code: "EE302", branch: "EEE", departmentId: "eee", year: 3 },
  { id: "sub-9", name: "Thermodynamics", code: "ME201", branch: "MECHANICAL", departmentId: "mech", year: 2 },
  { id: "sub-10", name: "Design of Machine Elements", code: "ME401", branch: "MECHANICAL", departmentId: "mech", year: 4 },
  { id: "sub-11", name: "Strength of Materials", code: "CE201", branch: "CIVIL", departmentId: "civil", year: 2 },
  { id: "sub-12", name: "Transportation Engineering", code: "CE401", branch: "CIVIL", departmentId: "civil", year: 4 },
];

const defaultFaculty = [
  {
    id: "fac-1",
    name: "Dr. Priya Sharma",
    employeeId: "FAC-CSE-101",
    branch: "CSE",
    departmentId: "cse",
    teaching: [
      { subjectId: "sub-3", year: 2, section: 1 },
      { subjectId: "sub-4", year: 3, section: 2 },
    ],
  },
  {
    id: "fac-2",
    name: "Prof. Arun Reddy",
    employeeId: "FAC-ECE-114",
    branch: "ECE",
    departmentId: "ece",
    teaching: [
      { subjectId: "sub-5", year: 2, section: 1 },
      { subjectId: "sub-6", year: 2, section: 3 },
    ],
  },
  {
    id: "fac-3",
    name: "Dr. Kavitha Rao",
    employeeId: "FAC-EEE-221",
    branch: "EEE",
    departmentId: "eee",
    teaching: [
      { subjectId: "sub-7", year: 3, section: 1 },
      { subjectId: "sub-8", year: 3, section: 2 },
    ],
  },
];

const parse = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const initializeAcademicData = () => {
  if (!localStorage.getItem(SUBJECTS_KEY)) {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(defaultSubjects));
  }
  if (!localStorage.getItem(FACULTY_KEY)) {
    localStorage.setItem(FACULTY_KEY, JSON.stringify(defaultFaculty));
  }
};

const withSubjectDepartment = (subject) => {
  const departmentId = inferDepartmentId(subject?.departmentId || subject?.branch);
  return {
    ...subject,
    departmentId,
    // Keep branch for legacy consumers.
    branch: subject?.branch || getDepartmentNameById(departmentId, ""),
  };
};

const withFacultyDepartment = (faculty) => {
  const departmentId = inferDepartmentId(faculty?.departmentId || faculty?.branch);
  return {
    ...faculty,
    departmentId,
    // Keep branch for legacy consumers.
    branch: faculty?.branch || getDepartmentNameById(departmentId, ""),
  };
};

export const getSubjects = () => parse(SUBJECTS_KEY, []).map(withSubjectDepartment);
export const getFaculty = () => parse(FACULTY_KEY, []).map(withFacultyDepartment);

export const saveSubjects = (subjects) => {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify((subjects || []).map(withSubjectDepartment)));
};

export const saveFaculty = (faculty) => {
  localStorage.setItem(FACULTY_KEY, JSON.stringify((faculty || []).map(withFacultyDepartment)));
};

export const removeSubjectFromFaculty = (subjectId) => {
  const faculty = getFaculty();
  const updated = faculty.map((item) => ({
    ...item,
    teaching: (item.teaching || []).filter((entry) => entry.subjectId !== subjectId),
  }));
  saveFaculty(updated);
};
