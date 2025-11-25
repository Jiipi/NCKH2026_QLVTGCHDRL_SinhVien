/**
 * Monitor Class Management API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho monitor class management features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Monitor Class Management API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Monitor Class Management API
 */
export const monitorClassManagementApi = {
  /**
   * Lấy danh sách lớp
   */
  async list() {
    try {
      const response = await http.get('/api/monitor/classes');
      const payload = response?.data?.data || response?.data || [];
      const items = Array.isArray(payload) ? payload : (payload.items || payload.data || []);
      return {
        success: true,
        data: items
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Export default
 */
export default monitorClassManagementApi;
