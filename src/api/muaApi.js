// src/api/muaApi.js — All Makeup Artist API calls

import api from "./axiosInstance";

// ── 1. List MUAs (filters + pagination) ───────────────────────
// params: { search, city, experience, status, start_date, end_date, page, page_size }
export const listMuas = (params = {}) =>
  api.get("/users/api/makeup-artists/", { params });

// ── 2. Get MUA Detail ──────────────────────────────────────────
export const getMua = (muaId) => api.get(`/users/api/makeup-artists/${muaId}/`);

// ── 3. Admin Create MUA ────────────────────────────────────────
export const createMua = (data) =>
  api.post("/users/admin/makeup-artists/create/", data);

// ── 4. Admin Update MUA ────────────────────────────────────────
export const updateMua = (muaId, data) =>
  api.put(`/users/admin/makeup-artists/${muaId}/update/`, data);

// ── 5. Admin Delete MUA ────────────────────────────────────────
export const deleteMua = (muaId) =>
  api.delete(`/users/admin/makeup-artists/${muaId}/delete/`);

// ── 6. Upload Images (profile_picture / gallery_images) ───────
export const uploadMuaImages = (muaId, formData) =>
  api.post(`/users/admin/makeup-artists/${muaId}/upload-images/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ── 7. Delete Single Gallery Image ────────────────────────────
export const deleteMuaGalleryImage = (muaId, imageUrl) =>
  api.delete(`/users/admin/makeup-artists/${muaId}/delete-gallery/`, {
    data: { image_url: imageUrl },
  });
