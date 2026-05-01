// src/api/dashboardApi.js
import api from "./axiosInstance";

/** GET /api/events/dashboard/stats/ — all metrics in one call */
export const getDashboardStats = () => api.get("/events/dashboard/stats/");

/** GET /api/events/dashboard/on-duty/ — on-duty staff with live locations */
export const getOnDutyStaff = () => api.get("/events/dashboard/on-duty/");
