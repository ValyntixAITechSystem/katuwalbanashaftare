import { api } from './api';

export const familyService = {
  getTree: (rootId) => api.get('/family/tree', { params: { rootId } }),
  getAncestors: (memberId) => api.get(`/family/${memberId}/ancestors`),
  getDescendants: (memberId) => api.get(`/family/${memberId}/descendants`),
  getRelationships: (memberId) => api.get(`/family/${memberId}/relationships`),
  addRelationship: (data) => api.post('/family/relationships', data),
  updateRelationship: (id, data) => api.put(`/family/relationships/${id}`, data),
  deleteRelationship: (id) => api.delete(`/family/relationships/${id}`),
};