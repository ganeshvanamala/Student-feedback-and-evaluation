import { CURRENT_DATA_VERSION, STORAGE_KEYS } from "./keys";
import { readJSON, writeJSON } from "../utils/storage";
import { inferDepartmentId, getDepartmentNameById } from "../utils/departments";

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined) return [];
  return [value];
}

function normalizeFormsByCategory(rawForms) {
  const normalized = { academics: [], sports: [], hostel: [] };
  const source = rawForms && typeof rawForms === "object" ? rawForms : {};

  Object.entries(source).forEach(([categoryId, value]) => {
    if (!normalized[categoryId]) normalized[categoryId] = [];
    if (Array.isArray(value)) {
      normalized[categoryId] = value.filter(Boolean);
      return;
    }
    if (value && typeof value === "object") {
      normalized[categoryId] = [value];
    }
  });

  return normalized;
}

function migrationV1() {
  // 1) Normalize admin forms structure to stable category arrays.
  const rawForms = readJSON(STORAGE_KEYS.ADMIN_FORMS, {});
  const normalizedForms = normalizeFormsByCategory(rawForms);
  writeJSON(STORAGE_KEYS.ADMIN_FORMS, normalizedForms);

  // 2) Ensure users have explicit role and scope placeholders.
  const users = readJSON(STORAGE_KEYS.REGISTERED_USERS, []);
  if (Array.isArray(users)) {
    const upgradedUsers = users.map((user) => ({
      ...user,
      role: user?.role || "student",
      departmentIds: toArray(user?.departmentIds || user?.profile?.department),
      subjectIds: toArray(user?.subjectIds),
    }));
    writeJSON(STORAGE_KEYS.REGISTERED_USERS, upgradedUsers);
  }

  // 3) Ensure complaint block list shape is always present.
  const blockList = readJSON(STORAGE_KEYS.COMPLAINT_BLOCK_LIST, null);
  const safeBlockList = {
    academics: toArray(blockList?.academics),
    sports: toArray(blockList?.sports),
    hostel: toArray(blockList?.hostel),
    categoryBlocked: blockList?.categoryBlocked && typeof blockList.categoryBlocked === "object" ? blockList.categoryBlocked : {},
  };
  writeJSON(STORAGE_KEYS.COMPLAINT_BLOCK_LIST, safeBlockList);
}

function migrationV2() {
  // Add stable departmentId to subjects while preserving branch.
  const subjects = readJSON(STORAGE_KEYS.BTECH_SUBJECTS, []);
  if (Array.isArray(subjects)) {
    const upgradedSubjects = subjects.map((subject) => {
      const departmentId = inferDepartmentId(subject?.departmentId || subject?.branch);
      return {
        ...subject,
        departmentId: departmentId || subject?.departmentId || "",
        branch: subject?.branch || getDepartmentNameById(departmentId, ""),
      };
    });
    writeJSON(STORAGE_KEYS.BTECH_SUBJECTS, upgradedSubjects);
  }

  // Add stable departmentId to faculty while preserving branch.
  const faculty = readJSON(STORAGE_KEYS.BTECH_FACULTY, []);
  if (Array.isArray(faculty)) {
    const upgradedFaculty = faculty.map((item) => {
      const departmentId = inferDepartmentId(item?.departmentId || item?.branch);
      return {
        ...item,
        departmentId: departmentId || item?.departmentId || "",
        branch: item?.branch || getDepartmentNameById(departmentId, ""),
      };
    });
    writeJSON(STORAGE_KEYS.BTECH_FACULTY, upgradedFaculty);
  }

  // Ensure users carry canonical departmentIds based on legacy profile.department/departmentIds.
  const users = readJSON(STORAGE_KEYS.REGISTERED_USERS, []);
  if (Array.isArray(users)) {
    const upgradedUsers = users.map((user) => {
      const inferredDepartmentIds = [
        ...toArray(user?.departmentIds),
        ...toArray(user?.profile?.department),
        ...toArray(user?.departmentId),
      ]
        .map((value) => inferDepartmentId(value))
        .filter((value, index, arr) => Boolean(value) && arr.indexOf(value) === index);

      return {
        ...user,
        departmentIds: inferredDepartmentIds,
      };
    });
    writeJSON(STORAGE_KEYS.REGISTERED_USERS, upgradedUsers);
  }
}

function migrationV3() {
  // Seed demo users and forms for development/testing
  // This migration is idempotent - it only adds data if specific IDs don't already exist

  // ============ SEED DEMO USERS ============
  const users = readJSON(STORAGE_KEYS.REGISTERED_USERS, []);

  // Helper to check if user exists by ID
  const userExists = (id) => users.some((u) => u.id === id);

  // Default password for all demo users
  const demoPassword = "demo@123";

  // HOD Users - One per department
  const hodUsers = [
    {
      id: "hod-cse",
      username: "hod-cse",
      password: demoPassword,
      role: "hod",
      departmentIds: ["cse"],
      profile: {
        fullName: "Dr. Rajesh Kumar",
        employeeId: "HOD-CSE-001",
        email: "hod.cse@university.edu",
        department: "cse",
      },
    },
    {
      id: "hod-ece",
      username: "hod-ece",
      password: demoPassword,
      role: "hod",
      departmentIds: ["ece"],
      profile: {
        fullName: "Prof. Anita Singh",
        employeeId: "HOD-ECE-001",
        email: "hod.ece@university.edu",
        department: "ece",
      },
    },
    {
      id: "hod-eee",
      username: "hod-eee",
      password: demoPassword,
      role: "hod",
      departmentIds: ["eee"],
      profile: {
        fullName: "Dr. Vikram Nair",
        employeeId: "HOD-EEE-001",
        email: "hod.eee@university.edu",
        department: "eee",
      },
    },
    {
      id: "hod-mech",
      username: "hod-mech",
      password: demoPassword,
      role: "hod",
      departmentIds: ["mech"],
      profile: {
        fullName: "Prof. Suresh Verma",
        employeeId: "HOD-MECH-001",
        email: "hod.mech@university.edu",
        department: "mech",
      },
    },
    {
      id: "hod-civil",
      username: "hod-civil",
      password: demoPassword,
      role: "hod",
      departmentIds: ["civil"],
      profile: {
        fullName: "Dr. Meera Patel",
        employeeId: "HOD-CIVIL-001",
        email: "hod.civil@university.edu",
        department: "civil",
      },
    },
  ];

  // Faculty Users - Comprehensive faculty for each department and subject
  const facultyUsers = [
    // CSE Faculty
    {
      id: "faculty-cse-1",
      username: "faculty-cse-1",
      password: demoPassword,
      role: "faculty",
      departmentIds: ["cse"],
      subjectIds: ["sub-1", "sub-2"], // Engineering Mathematics & Programming in C
      profile: {
        fullName: "Dr. Priya Sharma",
        employeeId: "FAC-CSE-101",
        email: "priya.sharma@university.edu",
        department: "cse",
      },
    },
    {
      id: "faculty-cse-2",
      username: "faculty-cse-2",
      password: demoPassword,
      role: "faculty",
      departmentIds: ["cse"],
      subjectIds: ["sub-3", "sub-4"], // Data Structures & DBMS
      profile: {
        fullName: "Prof. Arun Reddy",
        employeeId: "FAC-CSE-102",
        email: "arun.reddy@university.edu",
        department: "cse",
      },
    },
    // ECE Faculty
    {
      id: "faculty-ece-1",
      username: "faculty-ece-1",
      password: demoPassword,
      role: "faculty",
      departmentIds: ["ece"],
      subjectIds: ["sub-5"], // Digital Logic Design
      profile: {
        fullName: "Dr. Kavitha Rao",
        employeeId: "FAC-ECE-101",
        email: "kavitha.rao@university.edu",
        department: "ece",
      },
    },
    {
      id: "faculty-ece-2",
      username: "faculty-ece-2",
      password: demoPassword,
      role: "faculty",
      departmentIds: ["ece"],
      subjectIds: ["sub-6"], // Signals and Systems
      profile: {
        fullName: "Prof. Ravi Kumar",
        employeeId: "FAC-ECE-102",
        email: "ravi.kumar@university.edu",
        department: "ece",
      },
    },
    // EEE Faculty
    {
      id: "faculty-eee-1",
      username: "faculty-eee-1",
      password: demoPassword,
      role: "faculty",
      departmentIds: ["eee"],
      subjectIds: ["sub-7"], // Power Systems
      profile: {
        fullName: "Dr. Amit Patel",
        employeeId: "FAC-EEE-101",
        email: "amit.patel@university.edu",
        department: "eee",
      },
    },
    {
      id: "faculty-eee-2",
      username: "faculty-eee-2",
      password: demoPassword,
      role: "faculty",
      departmentIds: ["eee"],
      subjectIds: ["sub-8"], // Electrical Machines
      profile: {
        fullName: "Prof. Neha Gupta",
        employeeId: "FAC-EEE-102",
        email: "neha.gupta@university.edu",
        department: "eee",
      },
    },
    // MECHANICAL Faculty
    {
      id: "faculty-mech-1",
      username: "faculty-mech-1",
      password: demoPassword,
      role: "faculty",
      departmentIds: ["mech"],
      subjectIds: ["sub-9"], // Thermodynamics
      profile: {
        fullName: "Dr. Rajiv Singh",
        employeeId: "FAC-MECH-101",
        email: "rajiv.singh@university.edu",
        department: "mech",
      },
    },
    {
      id: "faculty-mech-2",
      username: "faculty-mech-2",
      password: demoPassword,
      role: "faculty",
      departmentIds: ["mech"],
      subjectIds: ["sub-10"], // Design of Machine Elements
      profile: {
        fullName: "Prof. Deepak Vora",
        employeeId: "FAC-MECH-102",
        email: "deepak.vora@university.edu",
        department: "mech",
      },
    },
    // CIVIL Faculty
    {
      id: "faculty-civil-1",
      username: "faculty-civil-1",
      password: demoPassword,
      role: "faculty",
      departmentIds: ["civil"],
      subjectIds: ["sub-11"], // Strength of Materials
      profile: {
        fullName: "Dr. Pooja Desai",
        employeeId: "FAC-CIVIL-101",
        email: "pooja.desai@university.edu",
        department: "civil",
      },
    },
    {
      id: "faculty-civil-2",
      username: "faculty-civil-2",
      password: demoPassword,
      role: "faculty",
      departmentIds: ["civil"],
      subjectIds: ["sub-12"], // Transportation Engineering
      profile: {
        fullName: "Prof. Arjun Iyer",
        employeeId: "FAC-CIVIL-102",
        email: "arjun.iyer@university.edu",
        department: "civil",
      },
    },
  ];

  // Student Users - Multiple students per department
  const studentUsers = [
    // CSE Students
    {
      id: "student-cse-1",
      username: "student-cse-1",
      password: demoPassword,
      role: "student",
      departmentIds: ["cse"],
      year: 2,
      profile: {
        fullName: "Aditya Kumar",
        studentId: "CSE-2022-001",
        email: "aditya.kumar@university.edu",
        department: "cse",
        year: 2,
      },
    },
    {
      id: "student-cse-2",
      username: "student-cse-2",
      password: demoPassword,
      role: "student",
      departmentIds: ["cse"],
      year: 2,
      profile: {
        fullName: "Bhavna Desai",
        studentId: "CSE-2022-002",
        email: "bhavna.desai@university.edu",
        department: "cse",
        year: 2,
      },
    },
    {
      id: "student-cse-3",
      username: "student-cse-3",
      password: demoPassword,
      role: "student",
      departmentIds: ["cse"],
      year: 2,
      profile: {
        fullName: "Chetan Patel",
        studentId: "CSE-2022-003",
        email: "chetan.patel@university.edu",
        department: "cse",
        year: 2,
      },
    },
    // ECE Students
    {
      id: "student-ece-1",
      username: "student-ece-1",
      password: demoPassword,
      role: "student",
      departmentIds: ["ece"],
      year: 2,
      profile: {
        fullName: "Divya Singh",
        studentId: "ECE-2022-001",
        email: "divya.singh@university.edu",
        department: "ece",
        year: 2,
      },
    },
    {
      id: "student-ece-2",
      username: "student-ece-2",
      password: demoPassword,
      role: "student",
      departmentIds: ["ece"],
      year: 2,
      profile: {
        fullName: "Eshwar Reddy",
        studentId: "ECE-2022-002",
        email: "eshwar.reddy@university.edu",
        department: "ece",
        year: 2,
      },
    },
    {
      id: "student-ece-3",
      username: "student-ece-3",
      password: demoPassword,
      role: "student",
      departmentIds: ["ece"],
      year: 2,
      profile: {
        fullName: "Fiona Kumar",
        studentId: "ECE-2022-003",
        email: "fiona.kumar@university.edu",
        department: "ece",
        year: 2,
      },
    },
    // EEE Students
    {
      id: "student-eee-1",
      username: "student-eee-1",
      password: demoPassword,
      role: "student",
      departmentIds: ["eee"],
      year: 3,
      profile: {
        fullName: "Gajendra Singh",
        studentId: "EEE-2021-001",
        email: "gajendra.singh@university.edu",
        department: "eee",
        year: 3,
      },
    },
    {
      id: "student-eee-2",
      username: "student-eee-2",
      password: demoPassword,
      role: "student",
      departmentIds: ["eee"],
      year: 3,
      profile: {
        fullName: "Harini Nair",
        studentId: "EEE-2021-002",
        email: "harini.nair@university.edu",
        department: "eee",
        year: 3,
      },
    },
    // MECHANICAL Students
    {
      id: "student-mech-1",
      username: "student-mech-1",
      password: demoPassword,
      role: "student",
      departmentIds: ["mech"],
      year: 2,
      profile: {
        fullName: "Ishaan Verma",
        studentId: "MECH-2022-001",
        email: "ishaan.verma@university.edu",
        department: "mech",
        year: 2,
      },
    },
    {
      id: "student-mech-2",
      username: "student-mech-2",
      password: demoPassword,
      role: "student",
      departmentIds: ["mech"],
      year: 2,
      profile: {
        fullName: "Jasmine Chopra",
        studentId: "MECH-2022-002",
        email: "jasmine.chopra@university.edu",
        department: "mech",
        year: 2,
      },
    },
    // CIVIL Students
    {
      id: "student-civil-1",
      username: "student-civil-1",
      password: demoPassword,
      role: "student",
      departmentIds: ["civil"],
      year: 2,
      profile: {
        fullName: "Kavya Iyer",
        studentId: "CIVIL-2022-001",
        email: "kavya.iyer@university.edu",
        department: "civil",
        year: 2,
      },
    },
    {
      id: "student-civil-2",
      username: "student-civil-2",
      password: demoPassword,
      role: "student",
      departmentIds: ["civil"],
      year: 2,
      profile: {
        fullName: "Lukas Kumar",
        studentId: "CIVIL-2022-002",
        email: "lukas.kumar@university.edu",
        department: "civil",
        year: 2,
      },
    },
  ];

  // Merge all demo users and add only those that don't exist
  const allDemoUsers = [...hodUsers, ...facultyUsers, ...studentUsers];
  const newUsers = allDemoUsers.filter((demoUser) => !userExists(demoUser.id));
  const updatedUsers = [...users, ...newUsers];
  writeJSON(STORAGE_KEYS.REGISTERED_USERS, updatedUsers);

  // ============ SEED DEMO FORMS ============
  const rawForms = readJSON(STORAGE_KEYS.ADMIN_FORMS, {});
  const forms = normalizeFormsByCategory(rawForms);

  // Helper to check if form already exists by ID
  const formExists = (id) => forms.academics.some((f) => f.id === id) || forms.sports.some((f) => f.id === id) || forms.hostel.some((f) => f.id === id);

  // Helper to generate realistic responses
  const generateResponses = (formId, studentIds, questions) => {
    return studentIds.flatMap((studentId, index) => {
      // Generate 2-3 responses per student
      const responseCount = index % 3 === 0 ? 3 : index % 2 === 0 ? 2 : 2;
      return Array.from({ length: responseCount }, (_, i) => ({
        id: `resp-${formId}-${studentId}-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString(),
        submittedBy: studentId,
        submittedByUserId: studentId,
        category: "academics",
        answers: {
          ...(questions[0]?.id && {
            [questions[0].id]: questions[0].type === "stars" ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 5) + 1,
          }),
          ...(questions[1]?.id && {
            [questions[1].id]: Math.floor(Math.random() * 5) + 1,
          }),
          ...(questions[2]?.id && {
            [questions[2].id]: ["Excellent", "Good", "Average", "Poor", "Very Useful", "Useful", "Neutral", "Not Useful", "Fair", "Somewhat Fair", "Unfair"][Math.floor(Math.random() * 11)],
          }),
        },
        contextData: {
          year: 2,
          dept: studentIds[0].includes("cse") ? "CSE" : studentIds[0].includes("ece") ? "ECE" : "OTHER",
        },
      }));
    });
  };

  // ===== CSE FORMS =====
  // Form: faculty-cse-1 teaching Engineering Mathematics (sub-1)
  const form1Id = "form-academics-cse-001-math";
  if (!formExists(form1Id)) {
    const questions = [
      { id: "q1", text: "How clear is the course content explanation?", type: "stars" },
      { id: "q2", text: "How satisfied are you with teaching methods?", type: "radio-5" },
      { id: "q3", text: "Overall course experience", type: "multiple-choice", options: ["Excellent", "Good", "Average", "Poor"] },
    ];
    const students = ["student-cse-1", "student-cse-2", "student-cse-3"];

    forms.academics.push({
      id: form1Id,
      title: "Engineering Mathematics-I Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-cse-1",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-1"],
      questions,
      responses: generateResponses(form1Id, students, questions),
      departmentIds: ["cse"],
      targetSubjectId: "sub-1",
    });
  }

  // Form: faculty-cse-1 teaching Programming in C (sub-2)
  const form2Id = "form-academics-cse-002-prog";
  if (!formExists(form2Id)) {
    const questions = [
      { id: "q1", text: "Programming concepts clarity", type: "stars" },
      { id: "q2", text: "Lab practical usefulness", type: "radio-5" },
      { id: "q3", text: "Assignment difficulty", type: "multiple-choice", options: ["Too Easy", "Moderate", "Challenging", "Very Difficult"] },
    ];
    const students = ["student-cse-1", "student-cse-2", "student-cse-3"];

    forms.academics.push({
      id: form2Id,
      title: "Programming in C Course Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-cse-1",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-2"],
      questions,
      responses: generateResponses(form2Id, students, questions),
      departmentIds: ["cse"],
      targetSubjectId: "sub-2",
    });
  }

  // Form: faculty-cse-2 teaching Data Structures (sub-3)
  const form3Id = "form-academics-cse-003-dsa";
  if (!formExists(form3Id)) {
    const questions = [
      { id: "q1", text: "Data Structures concepts clarity", type: "stars" },
      { id: "q2", text: "Quality of assignments", type: "radio-5" },
      { id: "q3", text: "Overall satisfaction", type: "multiple-choice", options: ["Very Useful", "Useful", "Neutral", "Not Useful"] },
    ];
    const students = ["student-cse-1", "student-cse-2", "student-cse-3"];

    forms.academics.push({
      id: form3Id,
      title: "Data Structures Course Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-cse-2",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-3"],
      questions,
      responses: generateResponses(form3Id, students, questions),
      departmentIds: ["cse"],
      targetSubjectId: "sub-3",
    });
  }

  // Form: faculty-cse-2 teaching DBMS (sub-4)
  const form4Id = "form-academics-cse-004-dbms";
  if (!formExists(form4Id)) {
    const questions = [
      { id: "q1", text: "Database concepts clarity", type: "stars" },
      { id: "q2", text: "Query optimization teaching", type: "radio-5" },
      { id: "q3", text: "Evaluation fairness", type: "multiple-choice", options: ["Fair", "Somewhat Fair", "Neutral", "Unfair"] },
    ];
    const students = ["student-cse-1", "student-cse-2", "student-cse-3"];

    forms.academics.push({
      id: form4Id,
      title: "Database Management Systems Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-cse-2",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-4"],
      questions,
      responses: generateResponses(form4Id, students, questions),
      departmentIds: ["cse"],
      targetSubjectId: "sub-4",
    });
  }

  // Form: HOD-CSE Department Feedback
  const form5Id = "form-academics-cse-005-hod";
  if (!formExists(form5Id)) {
    const questions = [
      { id: "q1", text: "Overall curriculum quality", type: "stars" },
      { id: "q2", text: "Faculty support level", type: "radio-5" },
      { id: "q3", text: "Infrastructure adequacy", type: "multiple-choice", options: ["Excellent", "Good", "Average", "Poor"] },
    ];
    const students = ["student-cse-1", "student-cse-2", "student-cse-3"];

    forms.academics.push({
      id: form5Id,
      title: "CSE Department Feedback Survey",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "hod-cse",
      createdByRole: "hod",
      scopeType: "department",
      scopeIds: ["cse"],
      questions,
      responses: generateResponses(form5Id, students, questions),
      departmentIds: ["cse"],
    });
  }

  // ===== ECE FORMS =====
  // Form: faculty-ece-1 teaching Digital Logic (sub-5)
  const form6Id = "form-academics-ece-001-dl";
  if (!formExists(form6Id)) {
    const questions = [
      { id: "q1", text: "Digital Logic Design clarity", type: "stars" },
      { id: "q2", text: "Practical lab sessions quality", type: "radio-5" },
      { id: "q3", text: "Overall satisfaction", type: "multiple-choice", options: ["Excellent", "Good", "Average", "Poor"] },
    ];
    const students = ["student-ece-1", "student-ece-2", "student-ece-3"];

    forms.academics.push({
      id: form6Id,
      title: "Digital Logic Design Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-ece-1",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-5"],
      questions,
      responses: generateResponses(form6Id, students, questions),
      departmentIds: ["ece"],
      targetSubjectId: "sub-5",
    });
  }

  // Form: faculty-ece-2 teaching Signals and Systems (sub-6)
  const form7Id = "form-academics-ece-002-ss";
  if (!formExists(form7Id)) {
    const questions = [
      { id: "q1", text: "Signals and Systems concepts clarity", type: "stars" },
      { id: "q2", text: "Mathematical rigor appropriateness", type: "radio-5" },
      { id: "q3", text: "Course delivery effectiveness", type: "multiple-choice", options: ["Very Useful", "Useful", "Neutral", "Not Useful"] },
    ];
    const students = ["student-ece-1", "student-ece-2", "student-ece-3"];

    forms.academics.push({
      id: form7Id,
      title: "Signals and Systems Course Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-ece-2",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-6"],
      questions,
      responses: generateResponses(form7Id, students, questions),
      departmentIds: ["ece"],
      targetSubjectId: "sub-6",
    });
  }

  // Form: HOD-ECE Department Feedback
  const form8Id = "form-academics-ece-003-hod";
  if (!formExists(form8Id)) {
    const questions = [
      { id: "q1", text: "Overall curriculum quality", type: "stars" },
      { id: "q2", text: "Faculty support level", type: "radio-5" },
      { id: "q3", text: "Laboratory equipment adequacy", type: "multiple-choice", options: ["Excellent", "Good", "Average", "Poor"] },
    ];
    const students = ["student-ece-1", "student-ece-2", "student-ece-3"];

    forms.academics.push({
      id: form8Id,
      title: "ECE Department Feedback Survey",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "hod-ece",
      createdByRole: "hod",
      scopeType: "department",
      scopeIds: ["ece"],
      questions,
      responses: generateResponses(form8Id, students, questions),
      departmentIds: ["ece"],
    });
  }

  // ===== EEE FORMS =====
  // Form: faculty-eee-1 teaching Power Systems (sub-7)
  const form9Id = "form-academics-eee-001-ps";
  if (!formExists(form9Id)) {
    const questions = [
      { id: "q1", text: "Power Systems concepts clarity", type: "stars" },
      { id: "q2", text: "Real-world application examples", type: "radio-5" },
      { id: "q3", text: "Lab experiments relevance", type: "multiple-choice", options: ["Excellent", "Good", "Average", "Poor"] },
    ];
    const students = ["student-eee-1", "student-eee-2"];

    forms.academics.push({
      id: form9Id,
      title: "Power Systems-I Course Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-eee-1",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-7"],
      questions,
      responses: generateResponses(form9Id, students, questions),
      departmentIds: ["eee"],
      targetSubjectId: "sub-7",
    });
  }

  // Form: faculty-eee-2 teaching Electrical Machines (sub-8)
  const form10Id = "form-academics-eee-002-em";
  if (!formExists(form10Id)) {
    const questions = [
      { id: "q1", text: "Electrical Machines content clarity", type: "stars" },
      { id: "q2", text: "Machinery operation explanation", type: "radio-5" },
      { id: "q3", text: "Hands-on practical sessions", type: "multiple-choice", options: ["Very Useful", "Useful", "Neutral", "Not Useful"] },
    ];
    const students = ["student-eee-1", "student-eee-2"];

    forms.academics.push({
      id: form10Id,
      title: "Electrical Machines Course Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-eee-2",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-8"],
      questions,
      responses: generateResponses(form10Id, students, questions),
      departmentIds: ["eee"],
      targetSubjectId: "sub-8",
    });
  }

  // ===== MECHANICAL FORMS =====
  // Form: faculty-mech-1 teaching Thermodynamics (sub-9)
  const form11Id = "form-academics-mech-001-thermo";
  if (!formExists(form11Id)) {
    const questions = [
      { id: "q1", text: "Thermodynamics concepts clarity", type: "stars" },
      { id: "q2", text: "Problem-solving demonstrations", type: "radio-5" },
      { id: "q3", text: "Overall appreciation", type: "multiple-choice", options: ["Excellent", "Good", "Average", "Poor"] },
    ];
    const students = ["student-mech-1", "student-mech-2"];

    forms.academics.push({
      id: form11Id,
      title: "Thermodynamics Course Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-mech-1",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-9"],
      questions,
      responses: generateResponses(form11Id, students, questions),
      departmentIds: ["mech"],
      targetSubjectId: "sub-9",
    });
  }

  // Form: faculty-mech-2 teaching Design of Machine Elements (sub-10)
  const form12Id = "form-academics-mech-002-dme";
  if (!formExists(form12Id)) {
    const questions = [
      { id: "q1", text: "Design concepts and principles clarity", type: "stars" },
      { id: "q2", text: "Practical design projects usefulness", type: "radio-5" },
      { id: "q3", text: "Industry relevance", type: "multiple-choice", options: ["Very Relevant", "Relevant", "Somewhat Relevant", "Not Relevant"] },
    ];
    const students = ["student-mech-1", "student-mech-2"];

    forms.academics.push({
      id: form12Id,
      title: "Design of Machine Elements Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-mech-2",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-10"],
      questions,
      responses: generateResponses(form12Id, students, questions),
      departmentIds: ["mech"],
      targetSubjectId: "sub-10",
    });
  }

  // ===== CIVIL FORMS =====
  // Form: faculty-civil-1 teaching Strength of Materials (sub-11)
  const form13Id = "form-academics-civil-001-som";
  if (!formExists(form13Id)) {
    const questions = [
      { id: "q1", text: "Strength of Materials concepts clarity", type: "stars" },
      { id: "q2", text: "Stress-strain calculation demonstrations", type: "radio-5" },
      { id: "q3", text: "Practical applications understanding", type: "multiple-choice", options: ["Excellent", "Good", "Average", "Poor"] },
    ];
    const students = ["student-civil-1", "student-civil-2"];

    forms.academics.push({
      id: form13Id,
      title: "Strength of Materials Course Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-civil-1",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-11"],
      questions,
      responses: generateResponses(form13Id, students, questions),
      departmentIds: ["civil"],
      targetSubjectId: "sub-11",
    });
  }

  // Form: faculty-civil-2 teaching Transportation Engineering (sub-12)
  const form14Id = "form-academics-civil-002-te";
  if (!formExists(form14Id)) {
    const questions = [
      { id: "q1", text: "Transportation concepts clarity", type: "stars" },
      { id: "q2", text: "Traffic analysis methods understanding", type: "radio-5" },
      { id: "q3", text: "Real-world problem case studies", type: "multiple-choice", options: ["Very Useful", "Useful", "Neutral", "Not Useful"] },
    ];
    const students = ["student-civil-1", "student-civil-2"];

    forms.academics.push({
      id: form14Id,
      title: "Transportation Engineering Course Feedback",
      category: "academics",
      createdAt: new Date().toLocaleDateString(),
      createdByUserId: "faculty-civil-2",
      createdByRole: "faculty",
      scopeType: "subject",
      scopeIds: ["sub-12"],
      questions,
      responses: generateResponses(form14Id, students, questions),
      departmentIds: ["civil"],
      targetSubjectId: "sub-12",
    });
  }

  // Persist updated forms
  writeJSON(STORAGE_KEYS.ADMIN_FORMS, forms);
}

const MIGRATIONS = Object.freeze({
  1: migrationV1,
  2: migrationV2,
  3: migrationV3,
});

function coerceVersion(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function getDataVersion() {
  return coerceVersion(readJSON(STORAGE_KEYS.DATA_VERSION, 0));
}

export function setDataVersion(version) {
  writeJSON(STORAGE_KEYS.DATA_VERSION, coerceVersion(version));
}

export function migrateData({ targetVersion = CURRENT_DATA_VERSION } = {}) {
  const target = coerceVersion(targetVersion);
  const startVersion = getDataVersion();
  let current = startVersion;

  if (current >= target) return { from: current, to: current, applied: [] };

  const applied = [];
  for (let nextVersion = current + 1; nextVersion <= target; nextVersion += 1) {
    const migrate = MIGRATIONS[nextVersion];
    if (typeof migrate === "function") {
      migrate();
      applied.push(nextVersion);
    }
    setDataVersion(nextVersion);
    current = nextVersion;
  }

  return { from: startVersion, to: current, applied };
}
