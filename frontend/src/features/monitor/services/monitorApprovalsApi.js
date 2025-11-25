/**
 * Monitor Approvals API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho monitor approvals features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Monitor Approvals API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Monitor Approvals API
 */
export const monitorApprovalsApi = {
  /**
   * Lấy danh sách đăng ký cần phê duyệt
   */
  async getRegistrations(params = {}) {
    try {
      const response = await http.get('/core/monitor/registrations', { params });
      const payload = response.data?.data || response.data || {};
      const items = payload.items || payload.data || (Array.isArray(payload) ? payload : []);
      return {
        success: true,
        data: {
          items: Array.isArray(items) ? items : [],
          total: payload.total || items.length,
          counts: payload.counts || { cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 }
        }
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Phê duyệt đăng ký
   */
  async approve(registrationId) {
    try {
      const response = await http.put(`/core/monitor/registrations/${registrationId}/approve`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Từ chối đăng ký
   */
  async reject(registrationId, reason) {
    try {
      const response = await http.put(`/core/monitor/registrations/${registrationId}/reject`, { reason });
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Phê duyệt hàng loạt
   */
  async bulkApprove(ids) {
    try {
      const response = await http.post('/core/registrations/bulk-approve', { ids });
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
   * Lấy chi tiết hoạt động
   */
  async getActivityDetail(activityId) {
    try {
      const response = await http.get(`/core/activities/${activityId}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Export default
 */
export default monitorApprovalsApi;

