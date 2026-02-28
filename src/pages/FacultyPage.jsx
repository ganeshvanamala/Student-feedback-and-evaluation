import React from "react";
import AdminPage from "./AdminPage";

const facultyMenu = [
  { label: "Dashboard", path: "/faculty/dashboard" },
  { label: "Forms", path: "/faculty/forms" },
  { label: "Responses", path: "/faculty/responses" },
  { label: "Analysis", path: "/faculty/analysis" },
];

function FacultyPage() {
  return <AdminPage basePath="/faculty" title="Faculty" menuItems={facultyMenu} />;
}

export default FacultyPage;
