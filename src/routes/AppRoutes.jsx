import React from "react";
import { Routes, Route } from "react-router-dom";

import UserRegister from "../pages/auth/UserRegister";
import UserLogin from "../pages/auth/UserLogIn";

import FoodPartnerRegister from "../pages/auth/FoodPartnerRegister";
import FoodPartnerLogin from "../pages/auth/FoodPartnerLogin";

import LandingPage from "../pages/general/LandingPage";
import Home from "../pages/general/Home";
import Public from "../pages/general/Public";

import Create_Food from "../pages/auth/food-partner/Create_Food";
import FoodPartnerProfile from "../pages/auth/food-partner/FoodPartnerProfile";

import ProtectedRoute from "./ProtectedRoutes";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* User Auth */}
      <Route path="/user/register" element={<UserRegister />} />
      <Route path="/user/login" element={<UserLogin />} />

      {/* Partner Auth */}
      <Route
        path="/food-partner/register"
        element={<FoodPartnerRegister />}
      />

      <Route
        path="/food-partner/login"
        element={<FoodPartnerLogin />}
      />

      {/* User Home */}
      <Route
        path="/home"
        element={
          <ProtectedRoute role="user">
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Create Reel */}
      <Route
        path="/food-partner/create-food"
        element={
          <ProtectedRoute role="partner">
            <Create_Food />
          </ProtectedRoute>
        }
      />

      {/* Partner Profile */}
      <Route
        path="/food-partner/profile"
        element={
          <ProtectedRoute role="partner">
            <FoodPartnerProfile />
          </ProtectedRoute>
        }
      />

      <Route
  path="/food-partner/:id"
  element={
    <ProtectedRoute role="partner">
      <FoodPartnerProfile />
    </ProtectedRoute>
  }
/>

      {/* Public Profile - Login Required */}
      <Route
        path="/public/:id"
        element={
          <ProtectedRoute>
            <Public />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#0f172a",
              color: "#fff",
              fontSize: "32px",
              fontWeight: "700",
            }}
          >
            404 - Page Not Found
          </div>
        }
      />

    </Routes>
  );
};

export default AppRoutes;