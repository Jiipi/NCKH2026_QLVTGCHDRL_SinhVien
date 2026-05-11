import http from '../../../shared/api/http';

const layoutApi = {
  async getAuthProfile() {
    const response = await http.get('/auth/profile');
    return response.data?.data || response.data;
  },

  async getNotifications(limit = 10) {
    const response = await http.get('/core/notifications', { params: { limit } });
    return response.data?.data || response.data || [];
  },

  async markNotificationRead(notificationId: string) {
    const response = await http.patch(`/core/notifications/${notificationId}/read`);
    return response.data?.data || response.data || {};
  },

  async markAllNotificationsRead() {
    const response = await http.patch('/core/notifications/mark-all-read');
    return response.data?.data || response.data || {};
  },

  async getNotificationDetail(notificationId: string) {
    const response = await http.get(`/core/notifications/${notificationId}`);
    return response.data?.data || response.data || {};
  },

  async getMonitorPendingRegistrationCount() {
    const response = await http.get('/core/monitor/registrations/pending-count');
    return response.data?.data || response.data || {};
  },

  async getTeacherPendingRegistrations() {
    const response = await http.get('/teacher/registrations/pending');
    return response.data?.data || response.data || {};
  }
};

export default layoutApi;
