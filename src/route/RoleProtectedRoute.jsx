import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleProtectedRoute({ allowedRoles = [] }) {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role?.toLowerCase()?.trim();

  if (!role) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!allowedRoles.includes(role)) {
    console.log("❌ Access denied:", role);
    return <Navigate to="/dashboard" replace />;
  }

  console.log("✅ Access granted:", role);

  return <Outlet />;
}

export default RoleProtectedRoute;