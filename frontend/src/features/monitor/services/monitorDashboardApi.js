/**
 * Monitor Dashboard API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho monitor dashboard features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Monitor Dashboard API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Monitor Dashboard API
 */
export const monitorDashboardApi = {
  /**
   * Lấy dữ liệu dashboard của lớp trưởng
   */
  async getDashboard(semester) {
    try {
      const params = semester ? { semester } : {};
      const response = await http.get('/core/monitor/dashboard', { params });
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách đăng ký của lớp
   */
  async getRegistrations(params = {}) {
    try {
      const response = await http.get('/core/monitor/registrations', { params });
      const payload = response?.data?.data || response?.data || {};
      const items = payload.items || payload.data || payload || [];
      return {
        success: true,
        data: {
          items: Array.isArray(items) ? items : [],
          total: payload.total || items.length,
          counts: payload.counts || { cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 }
        }
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy số lượng đăng ký chờ duyệt
   */
  async getPendingCount() {
    try {
      const response = await http.get('/core/monitor/registrations/pending-count');
      return {
        success: true,
        data: response?.data?.data || { count: 0 }
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Export default
 */
export default monitorDashboardApi;

