/**
 * Monitor Student Management API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho monitor student management features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Monitor Student Management API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Monitor Student Management API
 */
export const monitorStudentManagementApi = {
  /**
   * Lấy danh sách sinh viên trong lớp
   */
  async list(params = {}) {
    try {
      const response = await http.get('/core/monitor/students', { params });
      const payload = response?.data?.data ?? response?.data ?? [];
      const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
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
export default monitorStudentManagementApi;
