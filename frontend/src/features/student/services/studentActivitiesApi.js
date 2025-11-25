/**
 * Student Activities API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho student activities features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Student Activities API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Student Activities API
 */
export const studentActivitiesApi = {
  /**
   * Lấy danh sách hoạt động của sinh viên
   */
  async getMyActivities(semester) {
    try {
      const params = semester ? { semester } : {};
      const response = await http.get('/core/dashboard/activities/me', { params });
      const payload = response?.data?.data ?? response?.data ?? [];
      const activities = Array.isArray(payload) ? payload : (payload.items || payload.data || []);
      return {
        success: true,
        data: activities
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Hủy đăng ký hoạt động
   */
  async cancelRegistration(activityId) {
    try {
      if (!activityId) {
        return { success: false, error: 'activityId là bắt buộc' };
      }
      const response = await http.post(`/core/activities/${activityId}/cancel`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Export default
 */
export default studentActivitiesApi;

