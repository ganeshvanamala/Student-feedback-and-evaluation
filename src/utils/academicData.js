const SUBJECTS_KEY = "btechSubjects";
const FACULTY_KEY = "btechFaculty";

export const BTECH_BRANCHES = ["CSE", "ECE", "EEE", "MECHANICAL", "CIVIL"];
export const BTECH_YEARS = [1, 2, 3, 4];
export const SECTION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const defaultSubjects = [
  { id: "sub-1", name: "Engineering Mathematics-I", code: "MA101", branch: "CSE", year: 1 },
  { id: "sub-2", name: "Programming in C", code: "CS102", branch: "CSE", year: 1 },
  { id: "sub-3", name: "Data Structures", code: "CS201", branch: "CSE", year: 2 },
  { id: "sub-4", name: "Database Management Systems", code: "CS301", branch: "CSE", year: 3 },
  { id: "sub-5", name: "Digital Logic Design", code: "EC201", branch: "ECE", year: 2 },
  { id: "sub-6", name: "Signals and Systems", code: "EC202", branch: "ECE", year: 2 },
  { id: "sub-7", name: "Power Systems-I", code: "EE301", branch: "EEE", year: 3 },
  { id: "sub-8", name: "Electrical Machines", code: "EE302", branch: "EEE", year: 3 },
  { id: "sub-9", name: "Thermodynamics", code: "ME201", branch: "MECHANICAL", year: 2 },
  { id: "sub-10", name: "Design of Machine Elements", code: "ME401", branch: "MECHANICAL", year: 4 },
  { id: "sub-11", name: "Strength of Materials", code: "CE201", branch: "CIVIL", year: 2 },
  { id: "sub-12", name: "Transportation Engineering", code: "CE401", branch: "CIVIL", year: 4 },
];

const defaultFaculty = [
  {
    id: "fac-1",
    name: "Dr. Priya Sharma",
    employeeId: "FAC-CSE-101",
    branch: "CSE",
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

export const getSubjects = () => parse(SUBJECTS_KEY, []);
export const getFaculty = () => parse(FACULTY_KEY, []);

export const saveSubjects = (subjects) => {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
};

export const saveFaculty = (faculty) => {
  localStorage.setItem(FACULTY_KEY, JSON.stringify(faculty));
};

export const removeSubjectFromFaculty = (subjectId) => {
  const faculty = getFaculty();
  const updated = faculty.map((item) => ({
    ...item,
    teaching: (item.teaching || []).filter((entry) => entry.subjectId !== subjectId),
  }));
  saveFaculty(updated);
};
