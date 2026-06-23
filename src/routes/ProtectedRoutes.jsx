import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const user = localStorage.getItem("user");
  const foodPartner = localStorage.getItem("foodPartner");

  // General protected routes
  if (!role && !user && !foodPartner) {
    return <Navigate to="/" replace />;
  }

  // User-only routes
  if (role === "user" && !user) {
    return <Navigate to="/user/login" replace />;
  }

  // Partner-only routes
  if (role === "partner" && !foodPartner) {
    return <Navigate to="/food-partner/login" replace />;
  }

  return children;
};

export default ProtectedRoute;