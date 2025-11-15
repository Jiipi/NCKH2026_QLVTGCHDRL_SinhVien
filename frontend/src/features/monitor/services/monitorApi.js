import http from '../../../shared/services/api/client';

const handleError = (error) => {
  console.error('[Monitor API Error]', error);
  return { success: false, error: error.response?.data?.message || 'Lỗi không xác định' };
};

class MonitorAPI {
  async getPendingApprovalsCount() {
    try {
      const response = await http.get('/core/monitor/registrations/pending-count');
      return { success: true, data: response.data?.data || { count: 0 } };
    } catch (error) {
      return handleError(error);
    }
  }
}

const monitorApi = new MonitorAPI();
export default monitorApi;

