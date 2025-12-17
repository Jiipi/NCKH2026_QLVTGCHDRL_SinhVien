/**
 * Monitor Activity Oversight API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho monitor activity oversight features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Monitor Activity Oversight API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Monitor Activity Oversight API
 */
export const monitorActivityOversightApi = {
  /**
   * Lấy danh sách hoạt động của lớp
   */
  async list(params = {}) {
    try {
      const response = await http.get('/core/monitor/activities', { params });
      const payload = response?.data?.data ?? response?.data ?? [];
      const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
      return {
        success: true,
        data: items
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách hoạt động có sẵn (cho đăng ký)
   */
  async getAvailableActivities(params = {}) {
    try {
      const response = await http.get('/core/activities', { params });
      const responseData = response.data?.data || response.data || {};
      const items = responseData.items || responseData.data || responseData || [];
      const total = responseData.total || (Array.isArray(items) ? items.length : 0);
      return {
        success: true,
        data: {
          items: Array.isArray(items) ? items : [],
          total
        }
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy metrics của hoạt động lớp
   */
  async metrics() {
    try {
      const response = await http.get('/core/monitor/activities/metrics');
      return {
        success: true,
        data: response?.data?.data ?? response?.data ?? null
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy chi tiết hoạt động
   */
  async getDetail(activityId) {
    try {
      const response = await http.get(`/core/activities/${activityId}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Cập nhật hoạt động
   */
  async update(activityId, updateData) {
    try {
      const response = await http.put(`/core/activities/${activityId}`, updateData);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Xóa hoạt động
   */
  async delete(activityId) {
    try {
      const response = await http.delete(`/core/activities/${activityId}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Đăng ký tham gia hoạt động
   */
  async register(activityId) {
    try {
      const response = await http.post(`/core/activities/${activityId}/register`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách loại hoạt động
   */
  async getActivityTypes() {
    try {
      const response = await http.get('/core/activity-types');
      const payload = response.data?.data ?? response.data ?? [];
      const items = Array.isArray(payload?.items)
        ? payload.items
        : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []));
      return {
        success: true,
        data: items
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy dashboard stats
   */
  async getDashboardStats(semester) {
    try {
      const params = semester ? { semester } : {};
      const response = await http.get('/core/monitor/dashboard', { params });
      const data = response.data?.data || response.data || {};
      return {
        success: true,
        data: data.summary || {}
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Export default
 */
export default monitorActivityOversightApi;
