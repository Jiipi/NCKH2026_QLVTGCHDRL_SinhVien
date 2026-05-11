import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Certificates API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

export const certificatesApi = {
  async list() {
    try {
      const response = await http.get('/core/dashboard/activities/me');
      const data = response.data?.data || [];
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

export default certificatesApi;
