import { api } from './api';

export const memberService = {
  getAll: (params = {}) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  getRelationships: (id) => api.get(`/members/${id}/relationships`),
  search: (query) => api.get('/members/search', { params: { query } }),
};