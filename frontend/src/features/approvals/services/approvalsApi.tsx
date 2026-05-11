import http from '../../../shared/api/http';

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
      const response = await http.get('/core/monitor/registrations', { params });
      const payload = response.data?.data || response.data || [];
      const data = Array.isArray(payload?.items) ? payload.items : payload;
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
      await http.put(`/core/monitor/registrations/${registrationId}/approve`);
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
      await http.put(`/core/monitor/registrations/${registrationId}/reject`, { reason });
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
      const results = await Promise.all(registrationIds.map(registrationId => this.approveRegistration(registrationId)));
      const approved = results.filter(result => result.success).length;
      const failed = results.length - approved;
      if (failed > 0) {
        return { success: false, error: `Đã duyệt ${approved}, thất bại ${failed} đăng ký.`, data: { approved, failed } };
      }
      return { success: true, data: { approved } };
    } catch (error) {
      return handleError(error);
    }
  }
}

const approvalsApi = new ApprovalsAPI();
export default approvalsApi;
