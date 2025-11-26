/**
 * Teacher Student Scores API Service (Tier 3: Data/API Layer)
 * ===========================================================
 * Single Responsibility: HTTP calls for teacher student scores only
 * 
 * @module features/teacher/services/teacherStudentScoresApi
 */

import http from '../../../shared/api/http';
import { 
  handleApiError, 
  createSuccessResponse, 
  createValidationError,
  extractApiData,
  extractArrayItems
} from './apiErrorHandler';

/**
 * Teacher Student Scores API
 */
export const teacherStudentScoresApi = {
  /**
   * Lấy danh sách điểm rèn luyện của sinh viên
   * @param {Object} [params] - Query params
   */
  async list(params = {}) {
    try {
      const response = await http.get('/api/teacher/student-scores', { params });
      const payload = extractApiData(response, {});
      const items = extractArrayItems(payload);
      const pagination = payload.pagination || {};
      
      return createSuccessResponse({
        items,
        total: typeof pagination.total === 'number' ? pagination.total : items.length,
        pagination
      });
    } catch (error) {
      return handleApiError(error, 'StudentScores.list');
    }
  },

  /**
   * Lấy chi tiết điểm rèn luyện của sinh viên
   * @param {string|number} studentId - ID sinh viên
   * @param {string} [semester] - Học kỳ
   */
  async getStudentScore(studentId, semester) {
    if (!studentId) {
      return createValidationError('studentId là bắt buộc');
    }
    
    try {
      const params = semester ? { semester } : {};
      const response = await http.get(`/api/teacher/student-scores/${studentId}`, { params });
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'StudentScores.getDetail');
    }
  }
};

/**
 * Export default
 */
export default teacherStudentScoresApi;
