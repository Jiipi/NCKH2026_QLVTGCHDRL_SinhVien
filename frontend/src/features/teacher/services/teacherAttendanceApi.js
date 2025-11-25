/**
 * Teacher Attendance API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho teacher attendance features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Teacher Attendance API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Teacher Attendance API
 */
export const teacherAttendanceApi = {
  /**
   * Lấy danh sách điểm danh
   */
  async list(params = {}) {
    try {
      const response = await http.get('/api/teacher/attendance', { params });
      const payload = response?.data?.data || response?.data || [];
      const items = Array.isArray(payload) ? payload : (payload.items || payload.data || []);
      return {
        success: true,
        data: items
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Cập nhật điểm danh
   */
  async updateAttendance(attendanceId, data) {
    try {
      if (!attendanceId) {
        return { success: false, error: 'attendanceId là bắt buộc' };
      }
      const response = await http.put(`/api/teacher/attendance/${attendanceId}`, data);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Tạo điểm danh mới
   */
  async createAttendance(data) {
    try {
      const response = await http.post('/api/teacher/attendance', data);
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
export default teacherAttendanceApi;
