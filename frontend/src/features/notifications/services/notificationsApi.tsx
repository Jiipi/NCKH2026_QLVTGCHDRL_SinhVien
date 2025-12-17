import http from '../../../shared/services/api/client';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface NotificationItem {
  id: string;
  thoi_gian?: string;
  time?: string;
  createdAt?: string;
  title?: string;
  message?: string;
  type?: string;
  unread?: boolean;
  [key: string]: unknown;
}

interface NotificationsResponse {
  items?: NotificationItem[];
  notifications?: NotificationItem[];
  unreadCount?: number;
}

const handleError = (error: ApiError) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Notifications API Error]', { message, error });
  return { success: false as const, error: message };
};

const formatTimeAgo = (timestamp: string | undefined): string => {
  try {
    if (!timestamp) return 'Không xác định';
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
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
      const responseData = (response.data?.data || response.data || {}) as NotificationsResponse;
      const items = (responseData.items || responseData.notifications || []).map((n: NotificationItem) => ({
        ...n,
        time: formatTimeAgo(n.thoi_gian || n.time || n.createdAt),
      }));
      return { success: true as const, data: items, unreadCount: responseData.unreadCount || 0 };
    } catch (error) {
      return handleError(error as ApiError);
    }
  }

  async getNotificationDetail(id: string) {
    try {
      const response = await http.get(`/core/notifications/${id}`);
      const data = (response.data?.data || response.data) as NotificationItem | null;
      if (data) {
        data.time = formatTimeAgo(data.thoi_gian || data.time || data.createdAt);
      }
      return { success: true as const, data };
    } catch (error) {
      return handleError(error as ApiError);
    }
  }

  async markAsRead(id: string) {
    try {
      await http.patch(`/core/notifications/${id}/read`);
      return { success: true as const };
    } catch (error) {
      return handleError(error as ApiError);
    }
  }

  async markAllAsRead() {
    try {
      await http.patch('/core/notifications/mark-all-read');
      return { success: true as const };
    } catch (error) {
      return handleError(error as ApiError);
    }
  }
}

const notificationsApi = new NotificationsAPI();
export default notificationsApi;

