import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error?.response?.data?.message || error?.message || 'Đã có lỗi xảy ra.';
  console.error('[AdminNotificationsAPI]', message, error);
  return { success: false, error: message };
};

const extractData = (response) => response?.data?.data ?? response?.data ?? null;

const adminNotificationsApi = {
  async fetchClasses() {
    try {
      const response = await http.get('/admin/classes');
      return { success: true, data: extractData(response) || [] };
    } catch (error) {
      return handleError(error);
    }
  },

  async fetchActivities(params = { limit: 100 }) {
    try {
      const response = await http.get('/admin/activities', { params });
      const data = extractData(response);
      return {
        success: true,
        data: Array.isArray(data) ? data : data?.activities || [],
      };
    } catch (error) {
      return handleError(error);
    }
  },

  async fetchStats() {
    try {
      const response = await http.get('/admin/notifications/broadcast/stats');
      return { success: true, data: extractData(response) || {} };
    } catch (error) {
      return handleError(error);
    }
  },

  async fetchHistory() {
    try {
      const response = await http.get('/admin/notifications/broadcast/history');
      const data = extractData(response) || {};
      return { success: true, data: data.history || [] };
    } catch (error) {
      return handleError(error);
    }
  },

  async sendBroadcast(payload) {
    try {
      const response = await http.post('/admin/notifications/broadcast', payload);
      const data = extractData(response) || {};
      return {
        success: true,
        data: {
          count: data.count || 0,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
};

export default adminNotificationsApi;

