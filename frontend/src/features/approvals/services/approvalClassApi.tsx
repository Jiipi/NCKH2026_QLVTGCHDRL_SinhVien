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
      const response = await http.get('/core/monitor/registrations', { params });
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
      await http.put(`/core/monitor/registrations/${registrationId}/approve`);
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
      await http.put(`/core/monitor/registrations/${registrationId}/reject`, { reason });
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
      const results = await Promise.all(registrationIds.map(registrationId => this.approveRegistration(registrationId)));
      const approved = results.filter(result => result.success).length;
      return createSuccessResponse({ approved, failed: results.length - approved });
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
      const results = await Promise.all(registrationIds.map(registrationId => this.rejectRegistration(registrationId, reason)));
      const rejected = results.filter(result => result.success).length;
      return createSuccessResponse({ rejected, failed: results.length - rejected });
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const approvalClassApi = new ApprovalClassApi();
export default approvalClassApi;
