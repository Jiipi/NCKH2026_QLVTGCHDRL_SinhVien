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
  targetRole?: string;
  targetClass?: string;
  targetDepartment?: string;
  activityId?: string;
}

const handleError = (error: ApiError) => {
  const message = error?.response?.data?.message || error?.message || 'Đã có lỗi xảy ra.';
  console.error('[AdminNotificationsAPI]', message, error);
  return { success: false as const, error: message };
};

const extractData = <T = unknown>(response: { data?: { data?: T } | T }): T | null => 
  (response?.data as { data?: T })?.data ?? (response?.data as T) ?? null;

const adminNotificationsApi = {
  async fetchClasses() {
    try {
      const response = await http.get('/admin/classes');
      return { success: true as const, data: extractData<unknown[]>(response) || [] };
    } catch (error) {
      return handleError(error as ApiError);
    }
  },

  async fetchActivities(params = { limit: 100 }) {
    try {
      const response = await http.get('/admin/activities', { params });
      const data = extractData<{ activities?: unknown[] } | unknown[]>(response);
      return {
        success: true as const,
        data: Array.isArray(data) ? data : (data as { activities?: unknown[] })?.activities || [],
      };
    } catch (error) {
      return handleError(error as ApiError);
    }
  },

  async fetchStats() {
    try {
      const response = await http.get('/admin/notifications/broadcast/stats');
      return { success: true as const, data: extractData<Record<string, unknown>>(response) || {} };
    } catch (error) {
      return handleError(error as ApiError);
    }
  },

  async fetchHistory() {
    try {
      const response = await http.get('/admin/notifications/broadcast/history');
      const data = extractData<{ history?: unknown[] }>(response) || {};
      return { success: true as const, data: data.history || [] };
    } catch (error) {
      return handleError(error as ApiError);
    }
  },

  async sendBroadcast(payload: BroadcastPayload) {
    try {
      const response = await http.post('/admin/notifications/broadcast', payload);
      const data = extractData<{ count?: number }>(response) || {};
      return {
        success: true as const,
        data: {
          count: data.count || 0,
        },
      };
    } catch (error) {
      return handleError(error as ApiError);
    }
  },
};

export default adminNotificationsApi;

