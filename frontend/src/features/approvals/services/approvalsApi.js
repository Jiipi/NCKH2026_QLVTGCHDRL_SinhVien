import apiClient from '../../../shared/services/api/client';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Approvals API Error]', { message, error });
  return { success: false, error: message };
};

class ApprovalsAPI {
  /**
   * Fetches all registrations for the current user's class.
   * @param {object} params - Query parameters, e.g., { semester }.
   * @returns {Promise<{success: boolean, data: Array, error?: string}>}
   */
  async getClassRegistrations(params = {}) {
    try {
      const response = await apiClient.get('/class/registrations', { params });
      const data = response.data?.data || response.data || [];
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Approves a single registration.
   * @param {string} registrationId - The ID of the registration to approve.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async approveRegistration(registrationId) {
    try {
      await apiClient.post(`/class/registrations/${registrationId}/approve`);
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Rejects a single registration.
   * @param {string} registrationId - The ID of the registration to reject.
   * @param {string} reason - The reason for rejection.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async rejectRegistration(registrationId, reason) {
    try {
      await apiClient.post(`/class/registrations/${registrationId}/reject`, { reason });
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Approves multiple registrations in bulk.
   * @param {Array<string>} registrationIds - An array of registration IDs to approve.
   * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
   */
  async bulkApproveRegistrations(registrationIds) {
    try {
      const response = await apiClient.post('/class/registrations/bulk-approve', { registrationIds });
      return { success: true, data: response.data?.data || null };
    } catch (error) {
      return handleError(error);
    }
  }
}

const approvalsApi = new ApprovalsAPI();
export default approvalsApi;
