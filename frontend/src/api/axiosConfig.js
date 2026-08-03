/**
 * src/api/axiosConfig.js
 * Centralized Axios configuration with interceptors for JWT.
 */
import axios from 'axios';

// Use Vite environment variable when available (VITE_API_URL), otherwise fallback to localhost
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: `${BASE.replace(/\/$/, '')}/api`,
});

// Ensure cookies (refresh tokens) are sent with requests when using cookie auth
api.defaults.withCredentials = true;

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
