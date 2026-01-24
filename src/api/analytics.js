import api from './campaigns';

export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getCampaignStats: (params) => api.get('/analytics/campaigns', { params }),
  getEmailStats: (params) => api.get('/analytics/emails', { params }),
  getEngagement: (params) => api.get('/analytics/engagement', { params }),
  getDeliveryStats: (params) => api.get('/analytics/delivery', { params }),
  getTimeline: (params) => api.get('/analytics/timeline', { params }),
  getTopPerformers: (params) => api.get('/analytics/top-performers', { params }),
  export: (params) => api.get('/analytics/export', { params, responseType: 'blob' }),
};

export default analyticsAPI;
