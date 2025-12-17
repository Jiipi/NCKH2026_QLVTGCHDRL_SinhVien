/**
 * Student Scores API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho student scores features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Student Scores API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Student Scores API
 */
export const studentScoresApi = {
  /**
   * Lấy điểm rèn luyện chi tiết
   */
  async getDetailedScores(semester) {
    try {
      const params = semester ? { semester } : {};
      const response = await http.get('/core/dashboard/scores/detailed', { params });
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
export default studentScoresApi;

