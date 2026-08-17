import axios from 'axios';

// Directly set the Railway backend URL
const API_BASE_URL = 'https://eduflow-production-03e6.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Attach the Sanctum token (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized response handling:
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eduflow_token');
      localStorage.removeItem('eduflow_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {})?.[0]?.[0] ||
      'Something went wrong. Please try again.';

    return Promise.reject({ ...error, message });
  }
);

export default api;
