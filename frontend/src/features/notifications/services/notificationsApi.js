import http from '../../../shared/services/api/client';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Notifications API Error]', { message, error });
  return { success: false, error: message };
};

const formatTimeAgo = (timestamp) => {
  try {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  } catch (error) {
    return 'Không xác định';
  }
};

class NotificationsAPI {
  async getNotifications(params = { limit: 10 }) {
    try {
      const response = await http.get('/core/notifications', { params });
      const data = response.data?.data || response.data || {};
      const items = (data.items || data.notifications || []).map(n => ({
        ...n,
        time: formatTimeAgo(n.thoi_gian || n.time || n.createdAt),
      }));
      return { success: true, data: items, unreadCount: data.unreadCount || 0 };
    } catch (error) {
      return handleError(error);
    }
  }

  async getNotificationDetail(id) {
    try {
      const response = await http.get(`/core/notifications/${id}`);
      const data = response.data?.data || response.data;
      if (data) {
        data.time = formatTimeAgo(data.thoi_gian || data.time || data.createdAt);
      }
      return { success: true, data };
    } catch (error) {
      return handleError(error);
    }
  }

  async markAsRead(id) {
    try {
      await http.patch(`/core/notifications/${id}/read`);
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }

  async markAllAsRead() {
    try {
      await http.patch('/core/notifications/mark-all-read');
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }
}

const notificationsApi = new NotificationsAPI();
export default notificationsApi;

