import http from '../../../shared/api/http';
import { handleApiError, createSuccessResponse, extractApiData, extractPaginatedData, extractArrayData } from './apiErrorHandler';

/**
 * Activity List API
 * Xử lý các operations liên quan đến danh sách hoạt động
 */
class ActivityListApi {
  /**
   * List activities với filter và pagination
   * @param {Object} params - Query params
   */
  async list(params = {}) {
    try {
      const response = await http.get('/core/activities', { params });
      const { items, total } = extractPaginatedData(response);
      return createSuccessResponse(items, total);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get my activities (student's registered activities)
   * @param {Object} params - Query params
   */
  async getMyActivities(params = {}) {
    try {
      const response = await http.get('/core/dashboard/activities/me', { params });
      const { items, total } = extractPaginatedData(response);
      return createSuccessResponse(items, total);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get class activities (for monitor)
   * @param {Object} params - Query params
   */
  async getClassActivities(params = {}) {
    try {
      const response = await http.get('/core/monitor/activities', { params });
      const { items, total } = extractPaginatedData(response);
      return createSuccessResponse(items, total);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get activity types for filter dropdowns
   */
  async getTypes() {
    try {
      const response = await http.get('/core/activity-types');
      return createSuccessResponse(extractArrayData(response));
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get class dashboard stats
   * @param {string} semester - Semester filter
   */
  async getClassStats(semester) {
    try {
      const params = semester ? { semester } : {};
      const response = await http.get('/core/monitor/dashboard', { params });
      return createSuccessResponse(extractApiData(response));
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const activityListApi = new ActivityListApi();
export default activityListApi;
