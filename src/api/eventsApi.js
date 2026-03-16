// src/api/eventsApi.js
import api from './axiosInstance';

// ── Admin: CRUD ────────────────────────────────────────────────
export const listEvents = (params) => api.get('/events/', { params });
export const createEvent = (data) => api.post('/events/create/', data);
export const getEvent = (id) => api.get(`/events/${id}/`);
export const updateEvent = (id, data) => api.put(`/events/${id}/update/`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}/delete/`);

// ── Status ─────────────────────────────────────────────────────
export const updateEventStatus = (id, data) =>
  api.put(`/events/${id}/status/`, data);

// ── Crew / Staff ───────────────────────────────────────────────
export const getAvailableStaff = (id, params) =>
  api.get(`/events/${id}/available-staff/`, { params });
export const assignCrew = (id, data) =>
  api.put(`/events/${id}/assign-crew/`, data);

// ── Live Tracking ──────────────────────────────────────────────
export const trackEvent = (id) => api.get(`/events/${id}/track/`);

// ── Payment ────────────────────────────────────────────────────
export const initiatePayment = (id, data) =>
  api.post(`/events/${id}/payment/initiate/`, data);
