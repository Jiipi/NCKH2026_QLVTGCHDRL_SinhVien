/**
 * Teacher Dashboard API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho teacher dashboard features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Teacher Dashboard API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Teacher Dashboard API
 */
export const teacherDashboardApi = {
  /**
   * Lấy dữ liệu dashboard của giáo viên
   */
  async getDashboard(semester, classId) {
    try {
      const params = {};
      if (semester) params.semester = semester;
      if (classId) params.classId = classId;
      const response = await http.get('/teacher/dashboard', Object.keys(params).length ? { params } : undefined);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Phê duyệt hoạt động
   */
  async approveActivity(activityId) {
    try {
      if (!activityId) {
        return { success: false, error: 'activityId là bắt buộc' };
      }
      const response = await http.post(`/teacher/activities/${activityId}/approve`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Từ chối hoạt động
   */
  async rejectActivity(activityId, reason) {
    try {
      if (!activityId) {
        return { success: false, error: 'activityId là bắt buộc' };
      }
      if (!reason) {
        return { success: false, error: 'Lý do từ chối là bắt buộc' };
      }
      const response = await http.post(`/teacher/activities/${activityId}/reject`, { reason });
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy thống kê báo cáo (overview) theo học kỳ
   */
  async getReportStatistics(params = {}) {
    try {
      const query = { ...params };
      if (query.semester === 'all' || !query.semester) {
        delete query.semester;
      }
      const response = await http.get('/teacher/reports/statistics', { params: query });
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
export default teacherDashboardApi;
