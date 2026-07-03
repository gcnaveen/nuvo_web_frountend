import api from './axiosInstance';

// ── Categories ─────────────────────────────────────────────────
export const listCategories  = ()       => api.get('/contacts/categories/');
export const createCategory  = (data)   => api.post('/contacts/categories/create/', data);
export const deleteCategory  = (id)     => api.delete(`/contacts/categories/${id}/delete/`);

// ── Contacts ───────────────────────────────────────────────────
export const listContacts    = (params) => api.get('/contacts/', { params });
export const createContact   = (data)   => api.post('/contacts/create/', data);
export const getContact      = (id)     => api.get(`/contacts/${id}/`);
export const updateContact   = (id, data) => api.put(`/contacts/${id}/update/`, data);
export const deleteContact   = (id)     => api.delete(`/contacts/${id}/delete/`);
