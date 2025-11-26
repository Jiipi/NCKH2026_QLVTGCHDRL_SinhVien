import http from '../../../shared/api/http';
import { handleApiError, createSuccessResponse } from './apiErrorHandler';

/**
 * Activity Registration API
 * Xử lý các operations liên quan đến đăng ký hoạt động
 */
class ActivityRegistrationApi {
  /**
   * Register for activity
   * @param {string} activityId - Activity ID
   */
  async register(activityId) {
    try {
      const response = await http.post(`/core/activities/${activityId}/register`);
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Cancel registration
   * @param {string} registrationId - Registration ID
   */
  async cancel(registrationId) {
    try {
      const response = await http.post(`/core/registrations/${registrationId}/cancel`);
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Check-in via QR scan
   * @param {string} activityId - Activity ID
   * @param {string} token - QR token
   */
  async checkIn(activityId, token) {
    try {
      const response = await http.post(`/core/activities/${activityId}/attendance/scan`, { token });
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get QR data for activity
   * @param {string} activityId - Activity ID
   */
  async getQRData(activityId) {
    try {
      const response = await http.get(`/core/activities/${activityId}/qr-data`);
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const activityRegistrationApi = new ActivityRegistrationApi();
export default activityRegistrationApi;
