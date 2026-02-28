import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/admin.css";

function AdminPage({ basePath = "/admin", title = "Admin", menuItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    // Redirect to dashboard if on base path.
    if (location.pathname === basePath) {
      navigate(`${basePath}/dashboard`);
    }
  }, [basePath, location.pathname, navigate]);

  return (
    <div className={`admin-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div
        className={`admin-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        basePath={basePath}
        title={title}
        menuItems={menuItems}
      />
      <div className="admin-right">
        <AdminTopbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
