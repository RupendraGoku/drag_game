import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 15000
});

export const apiErrorMessage = (error) =>
  error.response?.data?.errors?.[0]?.message || error.response?.data?.message || error.message || 'Request failed';
