/**
 * Approval Admin API
 * Xử lý các operations phê duyệt cấp Admin (toàn hệ thống)
 */
import http from '../../../shared/api/http';
import { handleApiError, createSuccessResponse } from './apiErrorHandler';

class ApprovalAdminApi {
  /**
   * Fetches all registrations across the system
   * @param {object} params - Query parameters
   */
  async getRegistrations(params = {}) {
    try {
      const response = await http.get('/admin/registrations', { params });
      const data = response?.data?.data || response?.data || {};
      return createSuccessResponse({
        items: Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []),
        total: parseInt(data.total || 0),
        counts: data.counts || {}
      });
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Approves a single registration (admin)
   * @param {string} registrationId - The ID of the registration to approve
   */
  async approveRegistration(registrationId) {
    try {
      await http.post(`/admin/registrations/${registrationId}/approve`);
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Rejects a single registration (admin)
   * @param {string} registrationId - The ID of the registration to reject
   * @param {string} reason - The reason for rejection
   */
  async rejectRegistration(registrationId, reason) {
    try {
      await http.post(`/admin/registrations/${registrationId}/reject`, { reason });
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Bulk action for registrations (admin)
   * @param {Array<string>} ids - Registration IDs
   * @param {string} action - 'approve' or 'reject'
   * @param {string} reason - Required for reject
   */
  async bulkAction(ids, action, reason = null) {
    try {
      const payload = { ids, action };
      if (reason) payload.reason = reason;
      
      const response = await http.post('/admin/registrations/bulk', payload);
      return createSuccessResponse(response.data?.data || null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get all activities for admin filter
   * @param {object} params - Query parameters
   */
  async getActivities(params = {}) {
    try {
      const response = await http.get('/admin/activities', { params });
      const list = response?.data?.data?.activities || response?.data?.data || response?.data || [];
      return createSuccessResponse(Array.isArray(list) ? list : []);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get all classes for admin filter
   */
  async getClasses() {
    try {
      const response = await http.get('/admin/reports/classes');
      const list = Array.isArray(response?.data?.data) 
        ? response.data.data 
        : (Array.isArray(response?.data) ? response.data : []);
      return createSuccessResponse(list);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const approvalAdminApi = new ApprovalAdminApi();
export default approvalAdminApi;
