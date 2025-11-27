/**
 * Admin User Management API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho admin user management features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';

const ADMIN_USERS_BASE = '/core/admin/users';
const ROLES_BASE = '/core/roles';
const CLASSES_BASE = '/core/classes';
const SESSIONS_BASE = '/core/sessions';

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
   * Lấy thống kê người dùng (số lượng theo vai trò, trạng thái)
   */
  async fetchStats() {
    try {
      const response = await http.get(`${ADMIN_USERS_BASE}/stats`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách người dùng với phân trang và bộ lọc
   */
  async fetchUsers({ page = 1, limit = 20, search = '', role = '', status = '' }) {
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
      if (status && status.trim()) {
        params.status = status.trim();
      }
      
      console.log('[userManagementApi.fetchUsers] Request params:', params);
      const response = await http.get(ADMIN_USERS_BASE, { params });
      console.log('[userManagementApi.fetchUsers] Response:', { 
        usersCount: response?.data?.data?.users?.length || 0,
        total: response?.data?.data?.pagination?.total || 0
      });
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
      const response = await http.get(`${ADMIN_USERS_BASE}/${userId}`);
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
      const response = await http.get(`${ADMIN_USERS_BASE}/${userId}/points`);
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
      const response = await http.get(ROLES_BASE);
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
      const response = await http.get(CLASSES_BASE);
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
      const response = await http.post(ADMIN_USERS_BASE, userData);
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
      const response = await http.put(`${ADMIN_USERS_BASE}/${userId}`, userData);
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
      const response = await http.delete(`${ADMIN_USERS_BASE}/${userId}`);
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
      const response = await http.patch(`${ADMIN_USERS_BASE}/${userId}/lock`);
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
      const response = await http.patch(`${ADMIN_USERS_BASE}/${userId}/unlock`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Lấy danh sách phiên hoạt động
   */
  async fetchActiveSessions({ minutes = 5 } = {}) {
    try {
      const response = await http.get(`${SESSIONS_BASE}/active-users`, {
        params: { minutes: String(minutes) }
      });
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
