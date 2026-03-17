// src/App.jsx
//
// Route structure:
//   /                    → Homepage (landing page, public)
//   /joinourteam         → Staff recruitment form (public)
//   /admin/login         → Admin login
//   /admin/register      → Admin register
//   /admin/verify-otp    → OTP verification
//   /admin/              → Dashboard (protected)
//   /admin/events        → Events, etc.

import React, { useEffect } from "react";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// ── Layouts ──────────────────────────────────────────────────
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// ── Public landing pages ──────────────────────────────────────
// import Homepage from "./pages/landing/Homepage";
// import RecruitmentFormPage from "./pages/landing/recruitment/RecruitmentFormPage";

// ── Admin auth pages ──────────────────────────────────────────
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";

// ── Admin app pages ───────────────────────────────────────────
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import TrackEvent from "./pages/TrackEvent";
import Staff from "./pages/user_management/Staff";
import StaffDetails from "./pages/user_management/StaffDetails";
import MakeupArtist from "./pages/user_management/MakeupArtist";
import MakeupArtistDetails from "./pages/user_management/MakeupArtistDetails";
import Clients from "./pages/user_management/Clients";
import ClientDetails from "./pages/user_management/ClientDetails";
import MasterData from "./pages/MasterData";
import Uniforms from "./pages/Uniforms";
import Reports from "./pages/Reports";

// Scroll to top on every navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* App start → admin login */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

          {/* ── Public landing pages ──────────────────────── */}
          {/* <Route
            path="/"
            element={<Homepage />}
          />
          <Route
            path="/joinourteam"
            element={<RecruitmentFormPage />}
          /> */}

          {/* ── Admin auth (no sidebar) ───────────────────── */}
          <Route path="/admin" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
          </Route>

          {/* Old bare paths → redirect to /admin/* */}
          <Route
            path="/login"
            element={<Navigate to="/admin/login" replace />}
          />
          <Route
            path="/register"
            element={<Navigate to="/admin/register" replace />}
          />
          <Route
            path="/verify-otp"
            element={<Navigate to="/admin/verify-otp" replace />}
          />

          {/* ── Protected admin routes ────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="events/:id/track" element={<TrackEvent />} />

            <Route path="staff" element={<Staff />} />
            <Route path="staff/:id" element={<StaffDetails />} />

            <Route path="makeup-artist" element={<MakeupArtist />} />
            <Route path="makeup-artist/:id" element={<MakeupArtistDetails />} />

            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetails />} />

            <Route path="master-data" element={<MasterData />} />
            <Route path="uniforms" element={<Uniforms />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Unknown /admin/* → dashboard */}
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          {/* Everything else → login */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
