// src/App.jsx

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";

// App pages
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public auth routes ─────────────────────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
          </Route>

          {/* ── Protected app routes ───────────────────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            {/* Events */}
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="events/:id/track" element={<TrackEvent />} />

            {/* Staff */}
            <Route path="staff" element={<Staff />} />
            <Route path="staff/:id" element={<StaffDetails />} />

            {/* Makeup Artists */}
            <Route path="makeup-artist" element={<MakeupArtist />} />
            <Route path="makeup-artist/:id" element={<MakeupArtistDetails />} />

            {/* Clients */}
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetails />} />

            {/* Other */}
            <Route path="master-data" element={<MasterData />} />
            <Route path="uniforms" element={<Uniforms />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* ── Catch-all → redirect to dashboard ─────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
