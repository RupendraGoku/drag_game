import { api } from './axiosInstance.js';

export const uploadApi = {
  image: (file, onUploadProgress) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/admin/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
  },
  removeImage: (publicId) => api.delete('/admin/uploads/image', { data: { publicId } })
};
