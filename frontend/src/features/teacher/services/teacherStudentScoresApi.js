/**
 * Teacher Student Scores API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho teacher student scores features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Teacher Student Scores API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Teacher Student Scores API
 */
export const teacherStudentScoresApi = {
  /**
   * Lấy danh sách điểm rèn luyện của sinh viên
   */
  async list(params = {}) {
    try {
      const response = await http.get('/api/teacher/student-scores', { params });
      const payload = response?.data?.data || response?.data || {};
      const items = payload.items || payload.data || payload || [];
      const arr = Array.isArray(items) ? items : [];
      const pagination = payload.pagination || {};
      return {
        success: true,
        data: {
          items: arr,
          total: typeof pagination.total === 'number' ? pagination.total : arr.length,
          pagination
        }
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy chi tiết điểm rèn luyện của sinh viên
   */
  async getStudentScore(studentId, semester) {
    try {
      if (!studentId) {
        return { success: false, error: 'studentId là bắt buộc' };
      }
      const params = semester ? { semester } : {};
      const response = await http.get(`/api/teacher/student-scores/${studentId}`, { params });
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
export default teacherStudentScoresApi;
