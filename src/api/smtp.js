import api from './campaigns';

export const smtpAPI = {
  getAll: () => api.get('/smtp'),
  getById: (id) => api.get(`/smtp/${id}`),
  create: (data) => api.post('/smtp', data),
  update: (id, data) => api.put(`/smtp/${id}`, data),
  delete: (id) => api.delete(`/smtp/${id}`),
  test: (id, testEmail) => api.post(`/smtp/${id}/test`, { testEmail }),
  setDefault: (id) => api.put(`/smtp/${id}/set-default`),
  getStats: (id) => api.get(`/smtp/${id}/stats`),
};

export default smtpAPI;
