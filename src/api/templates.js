import api from './campaigns';

export const templatesAPI = {
  getAll: (params) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  duplicate: (id) => api.post(`/templates/${id}/duplicate`),
  preview: (id, data) => api.post(`/templates/${id}/preview`, data),
  getVariables: (id) => api.get(`/templates/${id}/variables`),
};

export default templatesAPI;
