/**
 * Teacher Activities API Service (Tier 3: Data/API Layer)
 * =======================================================
 * Single Responsibility: HTTP calls for teacher activities only
 * 
 * @module features/teacher/services/teacherActivitiesApi
 */

import http from '../../../shared/api/http';
import { 
  handleApiError, 
  createSuccessResponse, 
  createValidationError,
  extractApiData,
  extractArrayItems
} from './apiErrorHandler';
import { emitActivitiesChange } from '../../../shared/lib/dataRefresh';

/**
 * Teacher Activities API
 */
export const teacherActivitiesApi = {
  /**
   * Lấy danh sách hoạt động
   * @param {Object} params - Query params
   * @param {number} [params.page=1] - Trang
   * @param {number|string} [params.limit='all'] - Số lượng mỗi trang (hoặc 'all' để lấy tất cả)
   * @param {string} [params.semester] - Học kỳ
   */
  async listActivities({ page = 1, limit = 'all', semester }) {
    try {
      const params = { page, limit };
      if (semester) params.semester = semester;
      
      const response = await http.get('/activities', { params });
      const root = extractApiData(response, {});
      const items = extractArrayItems(root);
      const pagination = root.pagination || {};
      
      return createSuccessResponse({
        items,
        total: typeof pagination.total === 'number' ? pagination.total : items.length,
        pagination
      });
    } catch (error) {
      return handleApiError(error, 'Activities.list');
    }
  },

  /**
   * Lấy chi tiết hoạt động
   * @param {string|number} id - ID hoạt động
   */
  async getActivity(id) {
    if (!id) {
      return createValidationError('id là bắt buộc');
    }
    
    try {
      const response = await http.get(`/activities/${id}`);
      return createSuccessResponse(extractApiData(response, null));
    } catch (error) {
      return handleApiError(error, 'Activities.getActivity');
    }
  },

  /**
   * Phê duyệt hoạt động
   * @param {string|number} id - ID hoạt động
   */
  async approveActivity(id) {
    if (!id) {
      return createValidationError('id là bắt buộc');
    }
    
    try {
      const response = await http.post(`/teacher/activities/${id}/approve`);
      emitActivitiesChange({ action: 'approve', id });
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Activities.approve');
    }
  },

  /**
   * Từ chối hoạt động
   * @param {string|number} id - ID hoạt động
   * @param {string} reason - Lý do từ chối
   */
  async rejectActivity(id, reason) {
    if (!id) {
      return createValidationError('id là bắt buộc');
    }
    if (!reason) {
      return createValidationError('Lý do từ chối là bắt buộc');
    }
    
    try {
      const response = await http.post(`/teacher/activities/${id}/reject`, { reason });
      emitActivitiesChange({ action: 'reject', id });
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Activities.reject');
    }
  }
};

/**
 * Export default
 */
export default teacherActivitiesApi;
