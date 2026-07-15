import { api } from './api';

export const donationService = {
  getAll: (params = {}) => api.get('/donations', { params }),
  getById: (id) => api.get(`/donations/${id}`),
  create: (data) => api.post('/donations', data),
  update: (id, data) => api.put(`/donations/${id}`, data),
  delete: (id) => api.delete(`/donations/${id}`),
  getStats: () => api.get('/donations/stats'),
};