/**
 * Teacher Attendance API Service (Tier 3: Data/API Layer)
 * =======================================================
 * Single Responsibility: HTTP calls for teacher attendance only
 * 
 * @module features/teacher/services/teacherAttendanceApi
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
 * Teacher Attendance API
 */
export const teacherAttendanceApi = {
  /**
   * Lấy danh sách điểm danh
   * @param {Object} [params] - Query params
   */
  async list(params = {}) {
    try {
      const response = await http.get('/api/teacher/attendance', { params });
      const payload = extractApiData(response, []);
      const items = extractArrayItems(payload);
      
      return createSuccessResponse(items);
    } catch (error) {
      return handleApiError(error, 'Attendance.list');
    }
  },

  /**
   * Cập nhật điểm danh
   * @param {string|number} attendanceId - ID điểm danh
   * @param {Object} data - Dữ liệu cập nhật
   */
  async updateAttendance(attendanceId, data) {
    if (!attendanceId) {
      return createValidationError('attendanceId là bắt buộc');
    }
    
    try {
      const response = await http.put(`/api/teacher/attendance/${attendanceId}`, data);
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Attendance.update');
    }
  },

  /**
   * Tạo điểm danh mới
   * @param {Object} data - Dữ liệu điểm danh
   */
  async createAttendance(data) {
    try {
      const response = await http.post('/api/teacher/attendance', data);
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Attendance.create');
    }
  }
};

/**
 * Export default
 */
export default teacherAttendanceApi;
