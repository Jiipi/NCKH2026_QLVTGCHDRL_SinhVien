import http from '../../../shared/api/http';
import { handleApiError, createSuccessResponse, extractApiData } from './apiErrorHandler';

/**
 * Activity CRUD API
 * Xử lý các operations cơ bản: create, read, update, delete
 */
class ActivityCrudApi {
  /**
   * Create new activity
   * @param {Object} activityData - Activity data
   * @param {Function} mapPayload - Optional mapper function
   */
  async create(activityData, mapPayload = null) {
    try {
      const body = mapPayload ? await mapPayload(activityData) : activityData;
      const response = await http.post('/core/activities', body);
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get activity details by ID
   * @param {string} activityId - Activity ID
   */
  async getById(activityId) {
    try {
      const response = await http.get(`/core/activities/${activityId}`);
      return createSuccessResponse(extractApiData(response));
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Update activity
   * @param {string} activityId - Activity ID
   * @param {Object} activityData - Updated data
   * @param {Function} mapPayload - Optional mapper function
   */
  async update(activityId, activityData, mapPayload = null) {
    try {
      const body = mapPayload ? await mapPayload(activityData) : activityData;
      const response = await http.put(`/core/activities/${activityId}`, body);
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Delete activity
   * @param {string} activityId - Activity ID
   */
  async delete(activityId) {
    try {
      await http.delete(`/core/activities/${activityId}`);
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const activityCrudApi = new ActivityCrudApi();
export default activityCrudApi;
