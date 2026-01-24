import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - logout user
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Contact API
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
};

// Group API
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  getContacts: (id, params) => api.get(`/groups/${id}/contacts`, { params }),
  addContacts: (id, contactIds) => api.post(`/groups/${id}/contacts`, { contactIds }),
  removeContacts: (id, contactIds) => api.delete(`/groups/${id}/contacts`, { data: { contactIds } }),
};

// Template API
export const templatesAPI = {
  getAll: (params) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  duplicate: (id) => api.post(`/templates/${id}/duplicate`),
  preview: (id, data) => api.post(`/templates/${id}/preview`, data),
};

// SMTP API
export const smtpAPI = {
  getAll: () => api.get('/smtp'),
  getById: (id) => api.get(`/smtp/${id}`),
  create: (data) => api.post('/smtp', data),
  update: (id, data) => api.put(`/smtp/${id}`, data),
  delete: (id) => api.delete(`/smtp/${id}`),
  test: (id) => api.post(`/smtp/${id}/test`),
  setDefault: (id) => api.put(`/smtp/${id}/set-default`),
};

// Campaign API
export const campaignsAPI = {
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  duplicate: (id) => api.post(`/campaigns/${id}/duplicate`),
  send: (id) => api.post(`/campaigns/${id}/send`),
  schedule: (id, data) => api.post(`/campaigns/${id}/schedule`, data),
  pause: (id) => api.post(`/campaigns/${id}/pause`),
  resume: (id) => api.post(`/campaigns/${id}/resume`),
  cancel: (id) => api.post(`/campaigns/${id}/cancel`),
  getStats: (id) => api.get(`/campaigns/${id}/stats`),
  getRecipients: (id, params) => api.get(`/campaigns/${id}/recipients`, { params }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getCampaignStats: (params) => api.get('/analytics/campaigns', { params }),
  getEmailStats: (params) => api.get('/analytics/emails', { params }),
  getEngagement: (params) => api.get('/analytics/engagement', { params }),
  getDeliveryStats: (params) => api.get('/analytics/delivery', { params }),
  getTimeline: (params) => api.get('/analytics/timeline', { params }),
  export: (params) => api.get('/analytics/export', { params }),
};

export default api;
