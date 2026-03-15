// src/api/masterApi.js — Master Data API calls

import api from './axiosInstance';

// ── Event Themes ───────────────────────────────────────────────
export const listThemes = () => api.get('/master/themes/');
export const createTheme = (fd) =>
  api.post('/master/themes/create/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateTheme = (id, fd) =>
  api.put(`/master/themes/${id}/update/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteTheme = (id) => api.delete(`/master/themes/${id}/delete/`);

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

// ── Subscription Plans ─────────────────────────────────────────
export const listPlans = () => api.get('/master/subscription/');
export const updatePlan = (name, data) =>
  api.put(`/master/subscription/${name}/update/`, data);

// ── Payment Terms ──────────────────────────────────────────────
export const getPaymentTerms = () => api.get('/master/payment/');
export const updatePaymentTerms = (data) =>
  api.put('/master/payment/update/', data);

// ── Inventory ──────────────────────────────────────────────────
export const listInventory = (params) =>
  api.get('/master/inventory/', { params });
export const getInventoryItem = (id) => api.get(`/master/inventory/${id}/`);
export const updateStock = (id, data) =>
  api.put(`/master/inventory/${id}/stock/`, data);
export const adjustInUse = (id, data) =>
  api.post(`/master/inventory/${id}/adjust/`, data);
export const getInventorySummary = () => api.get('/master/inventory/summary/');
