/**
 * Student Dashboard API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho student dashboard features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Student Dashboard API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Student Dashboard API
 */
export const studentDashboardApi = {
  /**
   * Lấy dữ liệu dashboard của sinh viên
   */
  async getDashboard(semester) {
    try {
      const params = semester ? { semester } : {};
      const response = await http.get('/core/dashboard/student', { params });
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
export default studentDashboardApi;

