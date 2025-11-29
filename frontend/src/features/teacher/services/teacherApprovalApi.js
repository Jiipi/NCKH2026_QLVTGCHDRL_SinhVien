/**
 * Teacher Approval API Service (Tier 3: Data/API Layer)
 * =====================================================
 * Single Responsibility: HTTP calls for teacher approval only
 * 
 * @module features/teacher/services/teacherApprovalApi
 */

import http from '../../../shared/api/http';
import { 
  handleApiError, 
  createSuccessResponse, 
  createValidationError,
  extractApiData,
  extractArrayItems
} from './apiErrorHandler';
import { emitApprovalsChange, emitActivitiesChange } from '../../../shared/lib/dataRefresh';

/**
 * Teacher Approval API
 */
export const teacherApprovalApi = {
  /**
   * Lấy danh sách hoạt động chờ phê duyệt
   * @param {Object} params - Query params
   * @param {string} [params.semester] - Học kỳ
   * @param {string} [params.search] - Từ khóa tìm kiếm
   */
  async getPending({ semester, search }) {
    try {
      const params = { page: 1, limit: 'all' };
      if (semester) params.semester = semester;
      if (search) params.search = search;
      
      const response = await http.get('/teacher/activities/pending', { params });
      const data = extractApiData(response, {});
      const items = extractArrayItems(data);
      
      return createSuccessResponse({
        items,
        stats: data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
      });
    } catch (error) {
      return handleApiError(error, 'Approval.getPending');
    }
  },

  /**
   * Lấy lịch sử phê duyệt
   * @param {Object} params - Query params
   * @param {string} [params.semester] - Học kỳ
   * @param {string} [params.search] - Từ khóa tìm kiếm
   * @param {string} [params.status] - Trạng thái
   */
  async getHistory({ semester, search, status }) {
    try {
      const params = { page: 1, limit: 'all' };
      if (semester) params.semester = semester;
      if (search) params.search = search;
      if (status && status !== 'all') params.status = status;
      
      const response = await http.get('/teacher/activities/history', { params });
      const data = extractApiData(response, {});
      const items = extractArrayItems(data);
      
      return createSuccessResponse(items);
    } catch (error) {
      return handleApiError(error, 'Approval.getHistory');
    }
  },

  /**
   * Phê duyệt hoạt động
   * @param {string|number} id - ID hoạt động
   */
  async approve(id) {
    if (!id) {
      return createValidationError('id là bắt buộc');
    }
    
    try {
      const response = await http.post(`/teacher/activities/${id}/approve`);
      // Emit both APPROVALS and ACTIVITIES events for cross-component sync
      emitApprovalsChange({ action: 'approve', id });
      emitActivitiesChange({ action: 'approve', id });
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Approval.approve');
    }
  },

  /**
   * Từ chối hoạt động
   * @param {string|number} id - ID hoạt động
   * @param {string} reason - Lý do từ chối
   */
  async reject(id, reason) {
    if (!id) {
      return createValidationError('id là bắt buộc');
    }
    if (!reason) {
      return createValidationError('Lý do từ chối là bắt buộc');
    }
    
    try {
      const response = await http.post(`/teacher/activities/${id}/reject`, { reason });
      // Emit both APPROVALS and ACTIVITIES events for cross-component sync
      emitApprovalsChange({ action: 'reject', id });
      emitActivitiesChange({ action: 'reject', id });
      return createSuccessResponse(extractApiData(response, {}));
    } catch (error) {
      return handleApiError(error, 'Approval.reject');
    }
  }
};

/**
 * Export default
 */
export default teacherApprovalApi;
