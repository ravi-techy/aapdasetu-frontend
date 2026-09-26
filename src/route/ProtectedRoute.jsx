import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TASK_ONLY_ROLES = new Set(["volunteer", "ngo_contact", "ngo"]);

function ProtectedRoute() {
  const { isLoggedIn, sessionExpired, user } = useAuth();
  const location = useLocation();

  if (!isLoggedIn && !sessionExpired) {
    return <Navigate to="/login" replace />;
  }

  // volunteer / ngo_contact can only access /task — redirect everything else
  if (user && TASK_ONLY_ROLES.has(user.role) && location.pathname !== "/task") {
    return <Navigate to="/task" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
