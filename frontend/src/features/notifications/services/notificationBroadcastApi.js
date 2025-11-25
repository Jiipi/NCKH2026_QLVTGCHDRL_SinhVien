import http from '../../../shared/services/api/client';

const handleError = (error) => {
  const message = error?.response?.data?.message || error?.message || 'Đã có lỗi xảy ra.';
  console.error('[NotificationBroadcastAPI]', message, error);
  return { success: false, error: message };
};

const extractData = (response) => response?.data?.data ?? response?.data ?? null;

const notificationBroadcastApi = {
  async fetchHistory() {
    try {
      const response = await http.get('/core/notifications/sent');
      const data = extractData(response) || {};
      return {
        success: true,
        data: {
          history: data.history || [],
          stats: data.stats || null,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },

  async fetchHistoryDetail(id) {
    try {
      const response = await http.get(`/core/notifications/sent/${id}`);
      return { success: true, data: extractData(response) };
    } catch (error) {
      return handleError(error);
    }
  },

  async sendNotification(payload) {
    try {
      await http.post('/core/notifications', payload);
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  },
};

export default notificationBroadcastApi;

