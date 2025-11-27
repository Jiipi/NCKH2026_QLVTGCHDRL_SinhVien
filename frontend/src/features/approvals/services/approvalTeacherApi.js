/**
 * Approval Teacher API
 * Xử lý các operations phê duyệt cấp Giảng viên
 */
import http from '../../../shared/api/http';
import { handleApiError, createSuccessResponse } from './apiErrorHandler';

class ApprovalTeacherApi {
  /**
   * Fetches activity registrations for teacher's activities
   * @param {object} params - Query parameters
   */
  async getActivityRegistrations(params = {}) {
    try {
      const response = await http.get('/teacher/activity-registrations', { params });
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
   * Fetches pending activities for teacher approval
   * @param {object} params - Query parameters
   */
  async getPendingActivities(params = {}) {
    try {
      const response = await http.get('/teacher/pending-activities', { params });
      const data = response?.data?.data || response?.data || {};
      return createSuccessResponse({
        items: Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []),
        total: parseInt(data.total || 0)
      });
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Approves a registration (teacher)
   * @param {string} registrationId - The ID of the registration to approve
   */
  async approveRegistration(registrationId) {
    try {
      await http.post(`/teacher/registrations/${registrationId}/approve`);
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Rejects a registration (teacher)
   * @param {string} registrationId - The ID of the registration to reject
   * @param {string} reason - The reason for rejection
   */
  async rejectRegistration(registrationId, reason) {
    try {
      await http.post(`/teacher/registrations/${registrationId}/reject`, { reason });
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Approves an activity (teacher)
   * @param {string} activityId - The ID of the activity to approve
   */
  async approveActivity(activityId) {
    try {
      await http.post(`/teacher/activities/${activityId}/approve`);
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Rejects an activity (teacher)
   * @param {string} activityId - The ID of the activity to reject
   * @param {string} reason - The reason for rejection
   */
  async rejectActivity(activityId, reason) {
    try {
      await http.post(`/teacher/activities/${activityId}/reject`, { reason });
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Bulk approve registrations (teacher)
   * @param {Array<string>} ids - Registration IDs
   */
  async bulkApproveRegistrations(ids) {
    try {
      const response = await http.post('/teacher/registrations/bulk-approve', { ids });
      return createSuccessResponse(response.data?.data || null);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const approvalTeacherApi = new ApprovalTeacherApi();
export default approvalTeacherApi;
