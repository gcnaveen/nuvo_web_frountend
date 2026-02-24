import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
// import Events from "./pages/Events";
import Staff from "./pages/user_management/Staff";
import Clients from "./pages/user_management/Clients";
import MakeupArtist from "./pages/user_management/MakeupArtist";
import Uniforms from "./pages/Uniforms";
import MasterData from "./pages/MasterData";
import Reports from "./pages/Reports";
import EventDetails from "./pages/EventDetails";
import TrackEvent from "./pages/TrackEvent";
import Events from "./pages/Events";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import StaffDetails from "./pages/user_management/StaffDetails";
import MakeupArtistDetails from "./pages/user_management/MakeupArtistDetails";

import ClientDetails from "./pages/user_management/ClientDetails";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Puplic Auth Routes  */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} /> {/* ✅ */}
            {/* to avoid the login page need to remove and move this inside the protected routes  */}
            <Route path="/" element={<MainLayout />}></Route>
          </Route>

          {/* tmpoary pages just to remove the auth */}
          <Route path="/" element={<MainLayout />}>
            <Route path="events" element={<Events />} />
            <Route path="events/details" element={<EventDetails />} />
            <Route path="events/track" element={<TrackEvent />} />

            <Route path="staff" element={<Staff />} />
            <Route path="staff/:id" element={<StaffDetails />} />

            <Route path="makeup-artitst" element={<MakeupArtist />} />
            <Route path="makeup-artist/:id" element={<MakeupArtistDetails />} />

            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="master-data" element={<MasterData />} />
            <Route path="uniforms" element={<Uniforms />} />
          </Route>

          {/* The Parent Route is the Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* The Index Route is the default page (Dashboard) */}
            <Route index element={<Dashboard />} />

            <Route path="reports" element={<Reports />} />

            {/* You can add more pages here easily later */}
            {/* <Route path="events" element={<EventsPage />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
