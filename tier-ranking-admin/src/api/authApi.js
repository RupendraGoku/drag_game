import { api } from './axiosInstance.js';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me')
};
