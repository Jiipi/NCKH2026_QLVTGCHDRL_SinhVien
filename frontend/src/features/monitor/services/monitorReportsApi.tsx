/**
 * Monitor Reports API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho monitor reports features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Monitor Reports API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Monitor Reports API
 */
export const monitorReportsApi = {
  /**
   * Lấy danh sách báo cáo
   */
  async list(params = {}) {
    try {
      const response = await http.get('/core/monitor/reports', { params });
      // API trả về object với các fields: overview, monthlyActivities, pointsDistribution, etc.
      const data = response?.data?.data ?? response?.data ?? null;
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Export default
 */
export default monitorReportsApi;
