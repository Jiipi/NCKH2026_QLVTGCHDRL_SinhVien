/**
 * Teacher Registrations API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho teacher registrations features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Teacher Registrations API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Teacher Registrations API
 */
export const teacherRegistrationsApi = {
  /**
   * Lấy danh sách đăng ký
   */
  async listRegistrations(params = {}) {
    try {
      const response = await http.get('/teacher/registrations', { params });
      // API trả về { success: true, data: [array] } hoặc { data: [array] }
      const payload = response?.data?.data || response?.data || [];
      const items = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : []);
      
      // Tính stats từ items
      const counts = {
        cho_duyet: items.filter(r => r.trang_thai_dk === 'cho_duyet').length,
        da_duyet: items.filter(r => r.trang_thai_dk === 'da_duyet').length,
        tu_choi: items.filter(r => r.trang_thai_dk === 'tu_choi').length,
        da_tham_gia: items.filter(r => r.trang_thai_dk === 'da_tham_gia').length
      };
      
      return {
        success: true,
        data: { items, total: items.length, counts }
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Phê duyệt đăng ký
   */
  async approveRegistration(id) {
    try {
      if (!id) {
        return { success: false, error: 'id là bắt buộc' };
      }
      const response = await http.post(`/teacher/registrations/${id}/approve`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Từ chối đăng ký
   */
  async rejectRegistration(id, reason) {
    try {
      if (!id) {
        return { success: false, error: 'id là bắt buộc' };
      }
      if (!reason) {
        return { success: false, error: 'Lý do từ chối là bắt buộc' };
      }
      const response = await http.post(`/teacher/registrations/${id}/reject`, { reason });
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Phê duyệt hàng loạt
   */
  async bulkApprove({ registrationIds }) {
    try {
      if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
        return { success: false, error: 'Danh sách đăng ký là bắt buộc' };
      }
      const response = await http.post('/teacher/registrations/bulk-approve', { registrationIds });
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách lớp của giáo viên
   */
  async fetchTeacherClasses() {
    try {
      const response = await http.get('/teacher/classes');
      const payload = response?.data?.data || response?.data || {};
      const list = Array.isArray(payload?.classes) ? payload.classes : (Array.isArray(payload) ? payload : []);
      return {
        success: true,
        data: list
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Export default
 */
export default teacherRegistrationsApi;
