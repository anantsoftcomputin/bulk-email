import api from './campaigns';

export const contactsAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  bulkDelete: (ids) => api.post('/contacts/bulk-delete', { ids }),
  import: (data) => api.post('/contacts/import', data),
  export: (params) => api.get('/contacts/export', { params }),
  addToGroup: (contactId, groupId) => api.post(`/contacts/${contactId}/groups`, { groupId }),
  removeFromGroup: (contactId, groupId) => api.delete(`/contacts/${contactId}/groups/${groupId}`),
  search: (query) => api.get('/contacts/search', { params: { q: query } }),
  getTags: () => api.get('/contacts/tags'),
};

export default contactsAPI;
