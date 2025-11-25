/**
 * Auth API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho auth features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Auth API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

/**
 * Auth API
 */
export const authApi = {
  /**
   * Đăng nhập
   */
  async login(credentials) {
    try {
      const response = await http.post('/auth/login', {
        maso: String(credentials.username || '').trim(),
        password: credentials.password,
        remember: !!credentials.remember
      });
      const data = response.data?.data || response.data || {};
      return {
        success: true,
        data: {
          token: data?.token || data?.data?.token,
          user: data?.user || null
        }
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Đăng ký tài khoản
   */
  async register(registerData) {
    try {
      // Map frontend field names to backend field names
      const payload = {
        ho_ten: registerData.name, // Backend expects ho_ten, not name
        maso: registerData.maso,
        email: registerData.email,
        password: registerData.password,
        khoa: registerData.khoa,
        lop_id: registerData.lopId || undefined, // Backend expects lop_id, not lopId
        ngay_sinh: registerData.ngaySinh || undefined, // Backend expects ngay_sinh (required for student record)
        gioi_tinh: registerData.gioiTinh || undefined, // Backend expects gioi_tinh
        sdt: registerData.sdt || undefined,
        dia_chi: registerData.diaChi || undefined // Backend expects dia_chi
        // Note: confirmPassword is not sent to backend (only used for frontend validation)
      };
      const response = await http.post('/auth/register', payload);
      return {
        success: true,
        data: response.data?.data || response.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Quên mật khẩu - Gửi mã OTP
   */
  async forgotPassword(email) {
    try {
      const response = await http.post('/auth/forgot-password', { email: email.trim() });
      return {
        success: true,
        data: response.data?.data || response.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Xác minh mã OTP
   */
  async verifyForgotPasswordCode(email, code) {
    try {
      const response = await http.post('/auth/verify-otp', {
        email: email.trim(),
        otp: code.trim()
      });
      return {
        success: true,
        data: response.data?.data || response.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(resetData) {
    try {
      // Backend endpoint: /auth/reset-password
      // Backend expects: { email, otp, newPassword }
      const payload = {
        email: resetData.email.trim(),
        otp: resetData.code.trim(),
        newPassword: resetData.password
      };

      const response = await http.post('/auth/reset-password', payload);
      return {
        success: true,
        data: response.data?.data || response.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách lớp
   */
  async getClasses() {
    try {
      const response = await http.get('/auth/classes');
      const raw = response.data?.data || response.data || [];
      const normalized = Array.isArray(raw)
        ? raw.map((c) => ({ id: c.value || c.id, ten_lop: c.label || c.ten_lop, khoa: c.khoa }))
        : [];
      return {
        success: true,
        data: normalized
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách khoa
   */
  async getFaculties() {
    try {
      const response = await http.get('/auth/faculties');
      const fdata = response.data?.data || response.data;
      const list = Array.isArray(fdata)
        ? fdata
            .map(x => typeof x === 'string' ? x : (x?.khoa || x?.label || x?.value))
            .filter(Boolean)
        : [];
      return {
        success: true,
        data: list
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Export default
 */
export default authApi;

