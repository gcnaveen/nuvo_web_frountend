// src/api/masterApi.js — Master Data API calls

import api from './axiosInstance';

// ── Uniform Categories ─────────────────────────────────────────
export const listUniforms = () => api.get('/master/uniform/');
export const createUniform = (fd) =>
  api.post('/master/uniform/create/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateUniform = (id, fd) =>
  api.put(`/master/uniform/${id}/update/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteUniform = (id) =>
  api.delete(`/master/uniform/${id}/delete/`);

// ── Crew Packages (Luxury / Premium) ──────────────────────────
export const listCrewPackages = () => api.get('/master/packages/');
export const updateCrewPackage = (type, data) =>
  api.put(`/master/packages/${type}/`, data);

// ── Subscription Plans (kept for reference — no longer used in product) ───
export const listPlans = () => api.get('/master/subscription/');
export const updatePlan = (name, data) =>
  api.put(`/master/subscription/${name}/update/`, data);

// ── Payment Terms ──────────────────────────────────────────────
export const getPaymentTerms = () => api.get('/master/payment/');
export const updatePaymentTerms = (data) =>
  api.put('/master/payment/update/', data);

// ── Coupons ────────────────────────────────────────────────────
export const listCoupons = () => api.get('/master/coupons/');
export const createCoupon = (data) => api.post('/master/coupons/create/', data);
export const updateCoupon = (id, data) => api.put(`/master/coupons/${id}/update/`, data);
export const deleteCoupon = (id) => api.delete(`/master/coupons/${id}/delete/`);

// ── Crew Members ───────────────────────────────────────────────
export const listCrewMembers = () => api.get('/master/crew/');
export const listCrewMembersPublic = () => api.get('/master/crew/public/');
export const createCrewMember = (fd) =>
  api.post('/master/crew/create/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateCrewMember = (id, fd) =>
  api.put(`/master/crew/${id}/update/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteCrewMember = (id) =>
  api.delete(`/master/crew/${id}/delete/`);

// ── Inventory ──────────────────────────────────────────────────
export const listInventory = (params) =>
  api.get('/master/inventory/', { params });
export const getInventoryItem = (id) => api.get(`/master/inventory/${id}/`);
export const updateStock = (id, data) =>
  api.put(`/master/inventory/${id}/stock/`, data);
export const adjustInUse = (id, data) =>
  api.post(`/master/inventory/${id}/adjust/`, data);
export const getInventorySummary = () => api.get('/master/inventory/summary/');
