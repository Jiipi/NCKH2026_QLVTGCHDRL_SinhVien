/**
 * Admin User Management API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho admin user management features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const handleError = (error) => {
  // Lấy message từ response hoặc error object
  let message = 'Đã có lỗi xảy ra.';
  const status = error.response?.status;
  
  if (error.response?.data) {
    message = error.response.data.message || 
              error.response.data.error || 
              error.response.data.msg || 
              message;
  } else if (error.message) {
    message = error.message;
  }
  
  // Chỉ log error nếu không phải 500 để tránh spam console
  // 500 errors thường là backend issues, không cần log chi tiết ở frontend
  if (status !== 500) {
    console.error('[Admin User Management API Error]', { message, status, error });
  } else {
    // Chỉ log ngắn gọn cho 500 errors
    console.warn('[Admin User Management API] Backend error (500):', message);
  }
  
  return { success: false, error: message, code: status || null };
};

/**
 * Admin User Management API
 */
export const userManagementApi = {
  /**
   * Lấy danh sách người dùng với phân trang và bộ lọc
   */
  async fetchUsers({ page = 1, limit = 20, search = '', role = '' }) {
    try {
      // Sử dụng params object thay vì URLSearchParams để axios tự xử lý
      const params = {
        page: page.toString(),
        limit: limit.toString()
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (role && role.trim()) {
        params.role = role.trim();
      }
      
      const response = await http.get('/admin/users', { params });
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy chi tiết người dùng theo ID
   */
  async fetchUserDetails(userId) {
    try {
      const response = await http.get(`/admin/users/${userId}`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy điểm của người dùng (cho sinh viên)
   */
  async fetchUserPoints(userId) {
    try {
      const response = await http.get(`/admin/users/${userId}/points`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách tất cả vai trò
   */
  async fetchRoles() {
    try {
      const response = await http.get('/admin/roles');
      return {
        success: true,
        data: response?.data?.data || response?.data || []
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách tất cả lớp
   */
  async fetchClasses() {
    try {
      const response = await http.get('/admin/classes');
      return {
        success: true,
        data: response?.data?.data || response?.data || []
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Tạo người dùng mới
   */
  async createUser(userData) {
    try {
      const response = await http.post('/admin/users', userData);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Cập nhật người dùng
   */
  async updateUser(userId, userData) {
    try {
      const response = await http.put(`/admin/users/${userId}`, userData);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Xóa người dùng
   */
  async deleteUser(userId) {
    try {
      const response = await http.delete(`/admin/users/${userId}`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Khóa tài khoản người dùng
   */
  async lockUser(userId) {
    try {
      const response = await http.patch(`/admin/users/${userId}/lock`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Mở khóa tài khoản người dùng
   */
  async unlockUser(userId) {
    try {
      const response = await http.patch(`/admin/users/${userId}/unlock`);
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
export default userManagementApi;
