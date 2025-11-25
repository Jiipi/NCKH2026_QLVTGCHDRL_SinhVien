/**
 * Teacher Activities API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho teacher activities features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Teacher Activities API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Teacher Activities API
 */
export const teacherActivitiesApi = {
  /**
   * Lấy danh sách hoạt động
   */
  async listActivities({ page = 1, limit = 100, semester }) {
    try {
      const params = { page, limit };
      if (semester) params.semester = semester;
      const response = await http.get('/activities', { params });
      const root = response?.data?.data || response?.data || {};
      const items = root.items || root.data || root || [];
      const arr = Array.isArray(items) ? items : [];
      const pagination = root.pagination || {};
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
   * Lấy chi tiết hoạt động
   */
  async getActivity(id) {
    try {
      if (!id) {
        return { success: false, error: 'id là bắt buộc' };
      }
      const response = await http.get(`/activities/${id}`);
      return {
        success: true,
        data: response?.data?.data || response?.data || null
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Phê duyệt hoạt động
   */
  async approveActivity(id) {
    try {
      if (!id) {
        return { success: false, error: 'id là bắt buộc' };
      }
      const response = await http.post(`/teacher/activities/${id}/approve`);
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
  async rejectActivity(id, reason) {
    try {
      if (!id) {
        return { success: false, error: 'id là bắt buộc' };
      }
      if (!reason) {
        return { success: false, error: 'Lý do từ chối là bắt buộc' };
      }
      const response = await http.post(`/teacher/activities/${id}/reject`, { reason });
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
export default teacherActivitiesApi;
