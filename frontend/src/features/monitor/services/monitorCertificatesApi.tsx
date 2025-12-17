/**
 * Monitor Certificates API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho monitor certificates features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Monitor Certificates API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Monitor Certificates API
 */
export const monitorCertificatesApi = {
  /**
   * Lấy danh sách chứng nhận (hoạt động đã tham gia)
   */
  async list() {
    try {
      const response = await http.get('/core/dashboard/activities/me');
      const data = response.data?.data || [];
      // Filter chỉ lấy các hoạt động đã tham gia (có chứng nhận)
      const certificates = Array.isArray(data) 
        ? data.filter(reg => reg.trang_thai_dk === 'da_tham_gia')
        : [];
      return {
        success: true,
        data: certificates
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách loại hoạt động
   */
  async getActivityTypes() {
    try {
      const response = await http.get('/core/activity-types');
      const payload = response.data?.data ?? response.data ?? [];
      const items = Array.isArray(payload?.items)
        ? payload.items
        : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []));
      return {
        success: true,
        data: items
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Export default
 */
export default monitorCertificatesApi;

