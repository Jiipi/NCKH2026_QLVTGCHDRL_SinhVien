/**
 * Shared Dashboard API (Tầng 3: Data/API)
 * API chung cho dashboard - dùng chung bởi student, monitor, và các role khác
 * Tách khỏi feature cụ thể để tránh cross-feature coupling
 */

import http from './http';
import { API_ENDPOINTS } from './endpoints';

const handleError = (error: any) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Shared Dashboard API Error]', { message, error });
  return { success: false as const, error: message, code: error.response?.status || null };
};

/**
 * Dashboard API chung - lấy dữ liệu cá nhân (student dashboard)
 */
export const dashboardApi = {
  async getStudentDashboard(semester?: string) {
    try {
      const params = semester ? { semester } : {};
      const response = await http.get(API_ENDPOINTS.dashboard.student, { params });
      return {
        success: true as const,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  async getMyActivities(semester?: string) {
    try {
      const params = semester ? { semester } : {};
      const response = await http.get(API_ENDPOINTS.dashboard.activitiesMe, { params });
      const payload = response?.data?.data ?? response?.data ?? [];
      const activities = Array.isArray(payload) ? payload : (payload.items || payload.data || []);
      return {
        success: true as const,
        data: activities
      };
    } catch (error) {
      return handleError(error);
    }
  },

  async getProfile() {
    try {
      const response = await http.get('/core/profile');
      return {
        success: true as const,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

export default dashboardApi;
