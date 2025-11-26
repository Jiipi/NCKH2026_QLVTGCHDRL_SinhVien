import http from '../../../shared/api/http';
import { handleApiError, createSuccessResponse } from './apiErrorHandler';

/**
 * Activity Teacher API
 * Xử lý các operations dành cho Teacher (GVCN)
 */
class ActivityTeacherApi {
  /**
   * Approve activity (teacher)
   * @param {string} activityId - Activity ID
   */
  async approve(activityId) {
    try {
      const response = await http.post(`/core/teachers/activities/${activityId}/approve`);
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Reject activity (teacher)
   * @param {string} activityId - Activity ID
   * @param {string} reason - Rejection reason
   */
  async reject(activityId, reason) {
    try {
      const response = await http.post(`/core/teachers/activities/${activityId}/reject`, { reason });
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const activityTeacherApi = new ActivityTeacherApi();
export default activityTeacherApi;
