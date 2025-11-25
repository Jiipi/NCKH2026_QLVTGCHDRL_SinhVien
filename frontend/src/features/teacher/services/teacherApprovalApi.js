/**
 * Teacher Approval API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho teacher approval features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Teacher Approval API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Teacher Approval API
 */
export const teacherApprovalApi = {
  /**
   * Lấy danh sách hoạt động chờ phê duyệt
   */
  async getPending({ semester, search }) {
    try {
      const params = { page: 1, limit: 100 };
      if (semester) params.semester = semester;
      if (search) params.search = search;
      const response = await http.get('/teacher/activities/pending', { params });
      const data = response?.data?.data || response?.data || {};
      const items = data.items || data.data || data || [];
      return {
        success: true,
        data: {
          items: Array.isArray(items) ? items : [],
          stats: data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
        }
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy lịch sử phê duyệt
   */
  async getHistory({ semester, search, status }) {
    try {
      const params = { page: 1, limit: 100 };
      if (semester) params.semester = semester;
      if (search) params.search = search;
      if (status && status !== 'all') params.status = status;
      const response = await http.get('/teacher/activities/history', { params });
      const data = response?.data?.data || response?.data || {};
      const items = data.items || data.data || data || [];
      return {
        success: true,
        data: Array.isArray(items) ? items : []
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Phê duyệt hoạt động
   */
  async approve(id) {
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
  async reject(id, reason) {
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
export default teacherApprovalApi;
