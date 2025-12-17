/**
 * Approval Class API
 * Xử lý các operations phê duyệt cấp lớp (Lớp trưởng)
 */
import http from '../../../shared/api/http';
import { handleApiError, createSuccessResponse, extractArrayData } from './apiErrorHandler';

class ApprovalClassApi {
  /**
   * Fetches all registrations for the current user's class
   * @param {object} params - Query parameters, e.g., { semester }
   */
  async getClassRegistrations(params = {}) {
    try {
      const response = await http.get('/class/registrations', { params });
      return createSuccessResponse(extractArrayData(response));
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Approves a single registration
   * @param {string} registrationId - The ID of the registration to approve
   */
  async approveRegistration(registrationId) {
    try {
      await http.post(`/class/registrations/${registrationId}/approve`);
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Rejects a single registration
   * @param {string} registrationId - The ID of the registration to reject
   * @param {string} reason - The reason for rejection
   */
  async rejectRegistration(registrationId, reason) {
    try {
      await http.post(`/class/registrations/${registrationId}/reject`, { reason });
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Approves multiple registrations in bulk
   * @param {Array<string>} registrationIds - An array of registration IDs to approve
   */
  async bulkApproveRegistrations(registrationIds) {
    try {
      const response = await http.post('/class/registrations/bulk-approve', { registrationIds });
      return createSuccessResponse(response.data?.data || null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Bulk reject registrations
   * @param {Array<string>} registrationIds - Registration IDs
   * @param {string} reason - Rejection reason
   */
  async bulkRejectRegistrations(registrationIds, reason) {
    try {
      const response = await http.post('/class/registrations/bulk-reject', { 
        registrationIds, 
        reason 
      });
      return createSuccessResponse(response.data?.data || null);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const approvalClassApi = new ApprovalClassApi();
export default approvalClassApi;
