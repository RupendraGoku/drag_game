import { api } from './axiosInstance.js';

export const genreApi = {
  list: (params) => api.get('/genres', { params }),
  featured: () => api.get('/genres/featured'),
  getBySlug: (slug) => api.get(`/genres/${slug}`),
  related: (slug) => api.get(`/genres/${slug}/related`)
};
