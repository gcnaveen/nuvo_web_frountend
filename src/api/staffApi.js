// src/api/staffApi.js
//
// All staff-related API calls for the admin panel.

import api from "./axiosInstance";

// ── 1. List Staff (with filters + pagination) ──────────────────
export const listStaff = (params = {}) => {
  return api.get("/users/api/staff/", { params });
};

// ── 2. Get Staff Detail ────────────────────────────────────────
export const getStaff = (staffId) => {
  return api.get(`/users/api/staff/${staffId}/`);
};

// ── 3. Admin Create Staff (direct, no OTP) ────────────────────
export const createStaff = (data) => {
  return api.post("/users/admin/staff/create/", data);
};

// ── 4. Admin Update Staff (full profile edit) ─────────────────
// data: { full_name, stage_name, gender, city, state, country,
//         package, experience_in_years, price_of_staff, status }
export const updateStaff = (staffId, data) => {
  return api.put(`/users/admin/staff/${staffId}/update/`, data);
};

// ── 5. Admin Delete Staff (hard delete) ───────────────────────
export const deleteStaff = (staffId) => {
  return api.delete(`/users/admin/staff/${staffId}/delete/`);
};

// ── 6. Change Staff Status ────────────────────────────────────
export const changeStaffStatus = (userId, status) => {
  return api.put("/users/admin/change-status/", { user_id: userId, status });
};

// ── 7. Admin Upload Staff Images (S3) ─────────────────────────
export const uploadStaffImages = (staffId, formData) => {
  return api.post(`/users/admin/staff/${staffId}/upload-images/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ── 8. Admin Delete Single Gallery Image ──────────────────────
export const deleteGalleryImage = (staffId, imageUrl) => {
  return api.delete(`/users/admin/staff/${staffId}/delete-gallery/`, {
    data: { image_url: imageUrl },
  });
};
