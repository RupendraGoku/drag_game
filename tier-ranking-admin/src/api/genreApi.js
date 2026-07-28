import { api } from './axiosInstance.js';

export const genreApi = {
  list: (params) => api.get('/admin/genres', { params }),
  create: (payload) => api.post('/admin/genres', payload),
  get: (id) => api.get(`/admin/genres/${id}`),
  update: (id, payload) => api.patch(`/admin/genres/${id}`, payload),
  remove: (id) => api.delete(`/admin/genres/${id}`),
  publish: (id) => api.patch(`/admin/genres/${id}/publish`),
  unpublish: (id) => api.patch(`/admin/genres/${id}/unpublish`),
  activate: (id) => api.patch(`/admin/genres/${id}/activate`),
  deactivate: (id) => api.patch(`/admin/genres/${id}/deactivate`),
  duplicate: (id) => api.post(`/admin/genres/${id}/duplicate`),
  preview: (id) => api.get(`/admin/genres/${id}/preview`)
};
