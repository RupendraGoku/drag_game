import { api } from './axiosInstance.js';

export const dashboardApi = {
  stats: () => api.get('/admin/dashboard/stats')
};
