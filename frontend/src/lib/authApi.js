import { apiFetch } from './apiClient';

async function requestAuth(path, payload) {
  const data = await apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data.token) {
    localStorage.setItem('sentinel_auth_token', data.token);
  }

  return data.user;
}

export const authApi = {
  login: ({ email, password }) => requestAuth('/login', { email, password }),
  register: ({ name, email, password }) => requestAuth('/register', { name, email, password }),
  logout: () => localStorage.removeItem('sentinel_auth_token'),
};
