/**
 * Student Profile API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho student profile features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Student Profile API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Student Profile API
 */
export const studentProfileApi = {
  /**
   * Lấy thông tin profile của sinh viên
   */
  async getProfile() {
    try {
      const response = await http.get('/core/profile');
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Cập nhật profile của sinh viên
   */
  async updateProfile(profileData) {
    try {
      if (!profileData) {
        return { success: false, error: 'profileData là bắt buộc' };
      }
      const response = await http.put('/core/profile', profileData);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Đổi mật khẩu
   */
  async changePassword(passwordData) {
    try {
      if (!passwordData) {
        return { success: false, error: 'passwordData là bắt buộc' };
      }
      const response = await http.put('/users/change-password', passwordData);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Export default
 */
export default studentProfileApi;

