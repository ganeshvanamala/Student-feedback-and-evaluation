export const STORAGE_KEYS = Object.freeze({
  DATA_VERSION: "dataVersion",

  AUTH_SESSION: "authSession",
  CURRENT_STUDENT: "currentStudent",
  REGISTERED_USERS: "registeredUsers",

  ADMIN_FORMS: "adminForms",
  STUDENT_REPLIES: "studentReplies",
  COMPLAINT_BLOCK_LIST: "complaintBlockList",

  ACADEMICS_COMPLAINTS: "academicsComplaints",
  SPORTS_COMPLAINTS: "sportsComplaints",
  HOSTEL_COMPLAINTS: "hostelComplaints",

  ACADEMICS_FEEDBACKS: "academicsFeedbacks",
  SPORTS_FEEDBACKS: "sportsFeedbacks",
  HOSTEL_FEEDBACKS: "hostelFeedbacks",

  ANALYSIS_SAMPLE_FORMS: "analysisSampleForms",

  BTECH_SUBJECTS: "btechSubjects",
  BTECH_FACULTY: "btechFaculty",

  HOME_THEME: "homeTheme",
});

// Increment when storage schema changes in a backward-incompatible way.
export const CURRENT_DATA_VERSION = 3;
