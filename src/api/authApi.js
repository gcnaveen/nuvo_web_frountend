// src/api/authApi.js
//
// All auth-related API calls.
// Views import from here — no raw axios calls in components.

import api from "./axiosInstance";

// ── 1. Admin Login (web panel) ────────────────────────────────
// Direct email + password login — no OTP for admins.
export const adminLogin = (email, password) => {
  return api.post("/auth/admin/login/", { email, password });
};

// ── 2. Send OTP (mobile app — Staff / Client / MakeupArtist) ──
export const sendOtp = (email, phoneNumber = null) => {
  const payload = { email, role: "ADMIN" };
  if (phoneNumber) payload.phone_number = phoneNumber;
  return api.post("/auth/send-otp/", payload);
};

// ── 3. Verify OTP ─────────────────────────────────────────────
export const verifyOtp = (email, otp) => {
  return api.post("/auth/verify-otp/", { email, role: "ADMIN", otp });
};

// ── 4. Refresh Token ──────────────────────────────────────────
export const refreshToken = (token) => {
  return api.post("/auth/refresh-token/", { refresh_token: token });
};

// ── 5. Logout ─────────────────────────────────────────────────
export const logout = (refreshToken) => {
  return api.post("/auth/logout/", { refresh_token: refreshToken });
};

// ── 6. Resend OTP ─────────────────────────────────────────────
export const resendOtp = (email) => {
  return api.post("/auth/resend-otp/", { email });
};

// ── 7. Get Logged-in User ─────────────────────────────────────
export const getMe = () => {
  return api.get("/auth/me/");
};

// ── 8. Register Admin ─────────────────────────────────────────
export const registerAdmin = (fullName, email, phoneNumber, password) => {
  return api.post("/auth/register/admin/", {
    full_name: fullName,
    email,
    phone_number: phoneNumber,
    password,
  });
};
