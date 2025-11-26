/**
 * Teacher Dashboard API Service (Tier 3: Data/API Layer)
 * ======================================================
 * Single Responsibility: HTTP calls for teacher dashboard only
 * 
 * @module features/teacher/services/teacherDashboardApi
 */

import http from '../../../shared/api/http';
import { 
  handleApiError, 
  createSuccessResponse, 
  createValidationError,
  extractApiData 
} from './apiErrorHandler';

/**
 * Teacher Dashboard API
 */
export const teacherDashboardApi = {
  /**
   * Lấy dữ liệu dashboard của giáo viên
   * @param {string} [semester] - Học kỳ
   * @param {string} [classId] - ID lớp
   */
  async getDashboard(semester, classId) {
    try {
      const params = {};
      if (semester) params.semester = semester;
      if (classId) params.classId = classId;
      
      const response = await http.get('/teacher/dashboard', 
        Object.keys(params).length ? { params } : undefined
      );
      
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Dashboard');
    }
  },

  /**
   * Phê duyệt hoạt động
   * @param {string|number} activityId - ID hoạt động
   */
  async approveActivity(activityId) {
    if (!activityId) {
      return createValidationError('activityId là bắt buộc');
    }
    
    try {
      const response = await http.post(`/teacher/activities/${activityId}/approve`);
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Dashboard.approveActivity');
    }
  },

  /**
   * Từ chối hoạt động
   * @param {string|number} activityId - ID hoạt động
   * @param {string} reason - Lý do từ chối
   */
  async rejectActivity(activityId, reason) {
    if (!activityId) {
      return createValidationError('activityId là bắt buộc');
    }
    if (!reason) {
      return createValidationError('Lý do từ chối là bắt buộc');
    }
    
    try {
      const response = await http.post(`/teacher/activities/${activityId}/reject`, { reason });
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Dashboard.rejectActivity');
    }
  },

  /**
   * Lấy thống kê báo cáo (overview) theo học kỳ
   * @param {Object} [params] - Query params
   */
  async getReportStatistics(params = {}) {
    try {
      const query = { ...params };
      if (query.semester === 'all' || !query.semester) {
        delete query.semester;
      }
      
      const response = await http.get('/teacher/reports/statistics', { params: query });
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Dashboard.getReportStatistics');
    }
  }
};

/**
 * Export default
 */
export default teacherDashboardApi;
