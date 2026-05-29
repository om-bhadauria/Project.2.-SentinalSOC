import axios from 'axios';

export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const getAuthToken = () => localStorage.getItem('sentinel_auth_token');

export const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...authHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'API request failed');
  }

  return data;
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
