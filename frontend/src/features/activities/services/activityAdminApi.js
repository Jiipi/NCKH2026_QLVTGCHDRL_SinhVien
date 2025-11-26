import http from '../../../shared/api/http';
import { handleApiError, createSuccessResponse, extractPaginatedData } from './apiErrorHandler';

/**
 * Activity Admin API
 * Xử lý các operations dành cho Admin
 */
class ActivityAdminApi {
  /**
   * List admin activities với filter và pagination
   * @param {Object} params - Query params
   */
  async list(params = {}) {
    try {
      const response = await http.get('/core/admin/activities', { params });
      const { items, total } = extractPaginatedData(response);
      return createSuccessResponse(items, total);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Delete activity (admin)
   * @param {string} activityId - Activity ID
   */
  async delete(activityId) {
    try {
      await http.delete(`/core/admin/activities/${activityId}`);
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Approve activity (admin)
   * @param {string} activityId - Activity ID
   */
  async approve(activityId) {
    try {
      const response = await http.post(`/core/admin/activities/${activityId}/approve`);
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Reject activity (admin)
   * @param {string} activityId - Activity ID
   * @param {string} reason - Rejection reason
   */
  async reject(activityId, reason) {
    try {
      const response = await http.post(`/core/admin/activities/${activityId}/reject`, { reason });
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const activityAdminApi = new ActivityAdminApi();
export default activityAdminApi;
