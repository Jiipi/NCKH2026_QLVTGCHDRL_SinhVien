/**
 * Admin User Management API Service (Tầng 3: Data/API)
 * DUY NHẤT nơi gọi API cho admin user management features
 * Không chứa business logic
 */

import http from '../../../shared/api/http';
import { AxiosError } from 'axios';

const ADMIN_USERS_BASE = '/core/admin/users';
const ROLES_BASE = '/core/roles';
const CLASSES_BASE = '/core/classes';
const DEPARTMENTS_BASE = '/core/departments';
const SESSIONS_BASE = '/core/sessions';

export interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number | null;
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  department?: string;
  class_id?: string;
  sortBy?: string;
  sortOrder?: string;
  [key: string]: string | number | undefined;
}

export interface FetchActiveSessionsParams {
  minutes?: number;
}

export interface UserData {
  [key: string]: unknown;
}

export interface UsersListData {
  items?: unknown[];
  total?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const handleError = (error: AxiosError): ApiResult => {
  // Lấy message từ response hoặc error object
  let message = 'Đã có lỗi xảy ra.';
  const status = error.response?.status;
  
  if (error.response?.data) {
    const data = error.response.data as { message?: string; error?: string; msg?: string };
    message = data.message || data.error || data.msg || message;
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
  async fetchStats(): Promise<ApiResult> {
    try {
      const response = await http.get(`${ADMIN_USERS_BASE}/stats`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Lấy danh sách người dùng với phân trang và bộ lọc
   */
  async fetchUsers({ page = 1, limit = 20, search = '', role = '', status = '' }: FetchUsersParams): Promise<ApiResult> {
    try {
      // Sử dụng params object thay vì URLSearchParams để axios tự xử lý
      const params: Record<string, string> = {
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
      return handleError(error as AxiosError);
    }
  },

  /**
   * Lấy chi tiết người dùng theo ID
   */
  async fetchUserDetails(userId: string): Promise<ApiResult> {
    try {
      const response = await http.get(`${ADMIN_USERS_BASE}/${userId}`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Lấy điểm của người dùng (cho sinh viên)
   */
  async fetchUserPoints(userId: string): Promise<ApiResult> {
    try {
      const response = await http.get(`${ADMIN_USERS_BASE}/${userId}/points`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Lấy danh sách tất cả vai trò
   */
  async fetchRoles(): Promise<ApiResult> {
    try {
      const response = await http.get(ROLES_BASE);
      return {
        success: true,
        data: response?.data?.data || response?.data || []
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Lấy danh sách tất cả lớp
   */
  async fetchClasses(): Promise<ApiResult> {
    try {
      const response = await http.get(CLASSES_BASE);
      return {
        success: true,
        data: response?.data?.data || response?.data || []
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Tạo người dùng mới
   */
  async createUser(userData: UserData): Promise<ApiResult> {
    try {
      const response = await http.post(ADMIN_USERS_BASE, userData);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Cập nhật người dùng
   */
  async updateUser(userId: string, userData: UserData): Promise<ApiResult> {
    try {
      const response = await http.put(`${ADMIN_USERS_BASE}/${userId}`, userData);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Xóa người dùng
   */
  async deleteUser(userId: string): Promise<ApiResult> {
    try {
      const response = await http.delete(`${ADMIN_USERS_BASE}/${userId}`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Khóa tài khoản người dùng
   */
  async lockUser(userId: string): Promise<ApiResult> {
    try {
      const response = await http.patch(`${ADMIN_USERS_BASE}/${userId}/lock`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Mở khóa tài khoản người dùng
   */
  async unlockUser(userId: string): Promise<ApiResult> {
    try {
      const response = await http.patch(`${ADMIN_USERS_BASE}/${userId}/unlock`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Lấy danh sách phiên hoạt động
   */
  async fetchActiveSessions({ minutes = 5 }: FetchActiveSessionsParams = {}): Promise<ApiResult> {
    try {
      const response = await http.get(`${SESSIONS_BASE}/active-users`, {
        params: { minutes: String(minutes) }
      });
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Lấy danh sách khoa
   */
  async fetchDepartments(): Promise<ApiResult> {
    try {
      const response = await http.get(DEPARTMENTS_BASE);
      return {
        success: true,
        data: response?.data?.data || response?.data || []
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Cập nhật trạng thái người dùng
   */
  async updateUserStatus(userId: string, status: string): Promise<ApiResult> {
    try {
      const response = await http.patch(`${ADMIN_USERS_BASE}/${userId}/status`, { status });
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Đặt lại mật khẩu người dùng
   */
  async resetPassword(userId: string): Promise<ApiResult> {
    try {
      const response = await http.post(`${ADMIN_USERS_BASE}/${userId}/reset-password`);
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Xóa nhiều người dùng
   */
  async bulkDeleteUsers(userIds: string[]): Promise<ApiResult> {
    try {
      const response = await http.post(`${ADMIN_USERS_BASE}/bulk-delete`, { userIds });
      return {
        success: true,
        data: response?.data?.data || response?.data || {}
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  }
};

/**
 * Export default
 */
export default userManagementApi;
