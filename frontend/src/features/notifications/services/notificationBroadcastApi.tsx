import http from '../../../shared/api/http';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface BroadcastPayload {
  tieu_de: string;
  noi_dung: string;
  scope: string;
  muc_do_uu_tien: string;
  phuong_thuc_gui: string;
  activityId?: string;
  nguoi_nhan_id?: string;
}

const handleError = (error: ApiError) => {
  const message = error?.response?.data?.message || error?.message || 'Đã có lỗi xảy ra.';
  console.error('[NotificationBroadcastAPI]', message, error);
  return { success: false as const, error: message };
};

const extractData = <T = unknown>(response: { data?: { data?: T } | T }): T | null =>
  (response?.data as { data?: T })?.data ?? (response?.data as T) ?? null;

const notificationBroadcastApi = {
  async fetchHistory() {
    try {
      const response = await http.get('/core/notifications/sent');
      const data = extractData<{ history?: unknown[]; stats?: unknown }>(response) || {};
      return {
        success: true as const,
        data: {
          history: data.history || [],
          stats: data.stats || null,
        },
      };
    } catch (error) {
      return handleError(error as ApiError);
    }
  },

  async fetchHistoryDetail(id: string) {
    try {
      const response = await http.get(`/core/notifications/sent/${id}`);
      return { success: true as const, data: extractData(response) };
    } catch (error) {
      return handleError(error as ApiError);
    }
  },

  async sendNotification(payload: BroadcastPayload) {
    try {
      await http.post('/core/notifications', payload);
      return { success: true as const };
    } catch (error) {
      return handleError(error as ApiError);
    }
  },
};

export default notificationBroadcastApi;

