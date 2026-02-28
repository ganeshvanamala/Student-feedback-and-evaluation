import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../auth/session";
import { canAccessRoute } from "../auth/accessControl";

function RoleRoute({ allowedRoles = [], redirectTo = "/", children }) {
  const location = useLocation();
  const user = getCurrentUser();
  const allowed = canAccessRoute(user, allowedRoles);
  const authed = isAuthenticated();

  if (!allowed) {
    // Preserve destination to support redirect-after-login flows later.
    return <Navigate to={redirectTo} state={{ from: location.pathname, authed }} replace />;
  }

  return children;
}

export default RoleRoute;
