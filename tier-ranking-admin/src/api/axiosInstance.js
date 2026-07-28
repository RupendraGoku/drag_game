import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true
});

let accessToken = localStorage.getItem('tier-admin-access') || sessionStorage.getItem('tier-admin-access') || '';
let isRefreshing = false;
let queue = [];

export const setAccessToken = (token, remember = false) => {
  accessToken = token || '';
  sessionStorage.removeItem('tier-admin-access');
  localStorage.removeItem('tier-admin-access');
  if (token) {
    const target = remember ? localStorage : sessionStorage;
    target.setItem('tier-admin-access', token);
  }
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh');
    if (error.response?.status !== 401 || original?._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch(Promise.reject);
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post('/auth/refresh');
      const remember = Boolean(localStorage.getItem('tier-admin-access'));
      setAccessToken(data.data.accessToken, remember);
      queue.forEach(({ resolve }) => resolve(data.data.accessToken));
      queue = [];
      original.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      setAccessToken('');
      queue.forEach(({ reject }) => reject(refreshError));
      queue = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const apiErrorMessage = (error) =>
  error.response?.data?.errors?.[0]?.message || error.response?.data?.message || error.message || 'Request failed';
