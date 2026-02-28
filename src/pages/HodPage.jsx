import React from "react";
import AdminPage from "./AdminPage";

const hodMenu = [
  { label: "Dashboard", path: "/hod/dashboard" },
  { label: "Forms", path: "/hod/forms" },
  { label: "Users", path: "/hod/users" },
  { label: "Responses", path: "/hod/responses" },
  { label: "Analysis", path: "/hod/analysis" },
];

function HodPage() {
  return <AdminPage basePath="/hod" title="HOD" menuItems={hodMenu} />;
}

export default HodPage;
