/**
 * Teacher Registrations API Service (Tier 3: Data/API Layer)
 * ==========================================================
 * Single Responsibility: HTTP calls for teacher registrations only
 * 
 * @module features/teacher/services/teacherRegistrationsApi
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
 * Calculate registration counts by status
 * @param {Array} items - Registration items
 * @returns {Object} Status counts
 */
function calculateRegistrationCounts(items) {
  return {
    cho_duyet: items.filter(r => r.trang_thai_dk === 'cho_duyet').length,
    da_duyet: items.filter(r => r.trang_thai_dk === 'da_duyet').length,
    tu_choi: items.filter(r => r.trang_thai_dk === 'tu_choi').length,
    da_tham_gia: items.filter(r => r.trang_thai_dk === 'da_tham_gia').length
  };
}

/**
 * Teacher Registrations API
 */
export const teacherRegistrationsApi = {
  /**
   * Lấy danh sách đăng ký
   * @param {Object} [params] - Query params
   */
  async listRegistrations(params = {}) {
    try {
      const response = await http.get('/teacher/registrations', { params });
      const payload = extractApiData(response, []);
      const items = extractArrayItems(payload);
      
      return createSuccessResponse({ 
        items, 
        total: items.length, 
        counts: calculateRegistrationCounts(items)
      });
    } catch (error) {
      return handleApiError(error, 'Registrations.list');
    }
  },

  /**
   * Phê duyệt đăng ký
   * @param {string|number} id - ID đăng ký
   */
  async approveRegistration(id) {
    if (!id) {
      return createValidationError('id là bắt buộc');
    }
    
    try {
      const response = await http.post(`/teacher/registrations/${id}/approve`);
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Registrations.approve');
    }
  },

  /**
   * Từ chối đăng ký
   * @param {string|number} id - ID đăng ký
   * @param {string} reason - Lý do từ chối
   */
  async rejectRegistration(id, reason) {
    if (!id) {
      return createValidationError('id là bắt buộc');
    }
    if (!reason) {
      return createValidationError('Lý do từ chối là bắt buộc');
    }
    
    try {
      const response = await http.post(`/teacher/registrations/${id}/reject`, { reason });
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Registrations.reject');
    }
  },

  /**
   * Phê duyệt hàng loạt
   * @param {Object} params - Params
   * @param {Array<string|number>} params.registrationIds - Danh sách ID đăng ký
   */
  async bulkApprove({ registrationIds }) {
    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return createValidationError('Danh sách đăng ký là bắt buộc');
    }
    
    try {
      const response = await http.post('/teacher/registrations/bulk-approve', { registrationIds });
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Registrations.bulkApprove');
    }
  },

  /**
   * Lấy danh sách lớp của giáo viên
   */
  async fetchTeacherClasses() {
    try {
      const response = await http.get('/teacher/classes');
      const payload = extractApiData(response, {});
      const list = Array.isArray(payload?.classes) 
        ? payload.classes 
        : extractArrayItems(payload);
      
      return createSuccessResponse(list);
    } catch (error) {
      return handleApiError(error, 'Registrations.fetchClasses');
    }
  }
};

/**
 * Export default
 */
export default teacherRegistrationsApi;
