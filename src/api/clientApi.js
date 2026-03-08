// src/api/clientApi.js
//
// All client-related API calls for the admin panel.
// URLs must match exactly what's registered in apps/users/urls.py

import api from "./axiosInstance";

// ── 1. List Clients (with filters + pagination) ───────────────
export const listClients = (params = {}) => {
  // params: { search, city, plan_type, status, start_date, end_date, page, page_size }
  return api.get("/users/api/clients/", { params });
};

// ── 2. Get Client Detail ──────────────────────────────────────
// clientId = ClientProfile.id (the id from list_clients results)
export const getClient = (clientId) => {
  return api.get(`/users/api/clients/${clientId}/`);
};

// ── 3. Admin Create Client ────────────────────────────────────
export const createClient = (data) => {
  // data: { full_name, email, phone_number, city, state, country, subscription_plan }
  return api.post("/users/admin/create-client/", data);
};

// ── 4. Update Client Subscription ────────────────────────────
export const updateSubscription = (userId, subscriptionPlan) => {
  return api.put("/users/admin/update-subscription/", {
    user_id: userId,
    subscription_plan: subscriptionPlan,
  });
};

// ── 6. Delete Client (hard delete) ───────────────────────────
export const deleteClient = (clientId) => {
  return api.delete(`/users/admin/clients/${clientId}/delete/`);
};

// ── 5. Change Client Status ───────────────────────────────────
export const changeClientStatus = (userId, status) => {
  return api.put("/users/admin/change-status/", {
    user_id: userId,
    status,
  });
};
