// src/api/axiosInstance.js
import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject }),
        )
          .then((token) => {
            orig.headers.Authorization = `Bearer ${token}`;
            return api(orig);
          })
          .catch((err) => Promise.reject(err));
      }
      orig._retry = true;
      isRefreshing = true;
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        _clearAndRedirect();
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token/`, {
          refresh_token: refresh,
        });
        const newToken = data.data.access_token;
        localStorage.setItem('access_token', newToken);
        processQueue(null, newToken);
        orig.headers.Authorization = `Bearer ${newToken}`;
        return api(orig);
      } catch (err) {
        processQueue(err, null);
        _clearAndRedirect();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

function _clearAndRedirect() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/admin/login';
}

export default api;
