/**
 * Teacher Dashboard API Service (Tier 3: Data/API Layer)
 * ======================================================
 * Single Responsibility: HTTP calls for teacher dashboard only
 * 
 * @module features/teacher/services/teacherDashboardApi
 */

import http from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/api/endpoints';
import {
  handleApiError,
  createSuccessResponse,
  createValidationError,
  extractApiData
} from './apiErrorHandler';

/** Report statistics parameters */
interface ReportStatsParams {
  semester?: string;
  [key: string]: unknown;
}

/**
 * Teacher Dashboard API
 */
export const teacherDashboardApi = {
  async getProfile() {
    try {
      const response = await http.get('/core/profile');
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Dashboard.getProfile');
    }
  },

  async updateProfile(payload: Record<string, unknown>) {
    try {
      const response = await http.put('/core/profile', payload);
      return createSuccessResponse(extractApiData(response, null));
    } catch (error) {
      return handleApiError(error, 'Dashboard.updateProfile');
    }
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    try {
      const response = await http.post('/auth/change-password', payload);
      return createSuccessResponse(extractApiData(response, null));
    } catch (error) {
      return handleApiError(error, 'Dashboard.changePassword');
    }
  },

  /**
   * Lấy dữ liệu dashboard của giáo viên
   * @param {string} [semester] - Học kỳ
   * @param {string} [classId] - ID lớp
   */
  async getDashboard(semester?: string, classId?: string) {
    try {
      const params: Record<string, string> = {};
      if (semester) params.semester = semester;
      if (classId) params.classId = classId;

      const response = await http.get(API_ENDPOINTS.dashboard.teacher,
        Object.keys(params).length ? { params } : undefined
      );

      return createSuccessResponse(extractApiData(response, null));
    } catch (error) {
      return handleApiError(error, 'Dashboard');
    }
  },

  /**
   * Phê duyệt hoạt động
   * @param {string|number} activityId - ID hoạt động
   * @param {string} [semester] - Học kỳ
   */
  async approveActivity(activityId: string | number, semester?: string) {
    if (!activityId) {
      return createValidationError('activityId là bắt buộc');
    }

    try {
      const config = semester ? { params: { semester } } : undefined;
      const response = await http.post(`/teacher/activities/${activityId}/approve`, undefined, config);
      return createSuccessResponse(extractApiData(response, null));
    } catch (error) {
      return handleApiError(error, 'Dashboard.approveActivity');
    }
  },

  /**
   * Từ chối hoạt động
   * @param {string|number} activityId - ID hoạt động
   * @param {string} reason - Lý do từ chối
   * @param {string} [semester] - Học kỳ
   */
  async rejectActivity(activityId: string | number, reason: string, semester?: string) {
    if (!activityId) {
      return createValidationError('activityId là bắt buộc');
    }
    if (!reason) {
      return createValidationError('Lý do từ chối là bắt buộc');
    }

    try {
      const config = semester ? { params: { semester } } : undefined;
      const response = await http.post(`/teacher/activities/${activityId}/reject`, { reason }, config);
      return createSuccessResponse(extractApiData(response, null));
    } catch (error) {
      return handleApiError(error, 'Dashboard.rejectActivity');
    }
  },

  /**
   * Lấy thống kê báo cáo (overview) theo học kỳ
   * @param {Object} [params] - Query params
   */
  async getReportStatistics(params: ReportStatsParams = {}) {
    try {
      const query: ReportStatsParams = { ...params };
      if (query.semester === 'all' || !query.semester) {
        delete query.semester;
      }

      const response = await http.get('/teacher/reports/statistics', { params: query });
      return createSuccessResponse(extractApiData(response, null));
    } catch (error) {
      return handleApiError(error, 'Dashboard.getReportStatistics');
    }
  }
};

/**
 * Export default
 */
export default teacherDashboardApi;
