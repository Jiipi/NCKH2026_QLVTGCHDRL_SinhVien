import http from '../../../shared/api/http';

/**
 * API service for admin user management
 */
export const userManagementApi = {
  /**
   * Fetch users with pagination and filters
   */
  async fetchUsers({ page = 1, limit = 20, search = '', role = '' }) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    
    const response = await http.get(`/admin/users?${params.toString()}`);
    return response.data?.data || response.data;
  },

  /**
   * Fetch user details by ID
   */
  async fetchUserDetails(userId) {
    const response = await http.get(`/admin/users/${userId}`);
    return response.data?.data || response.data;
  },

  /**
   * Fetch user points (for students)
   */
  async fetchUserPoints(userId) {
    const response = await http.get(`/admin/users/${userId}/points`);
    return response.data?.data || response.data;
  },

  /**
   * Fetch all roles
   */
  async fetchRoles() {
    const response = await http.get('/admin/roles');
    return response.data?.data || response.data;
  },

  /**
   * Fetch all classes
   */
  async fetchClasses() {
    const response = await http.get('/admin/classes');
    return response.data?.data || response.data || [];
  },

  /**
   * Create new user
   */
  async createUser(userData) {
    const response = await http.post('/admin/users', userData);
    return response.data;
  },

  /**
   * Update existing user
   */
  async updateUser(userId, userData) {
    const response = await http.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    const response = await http.delete(`/admin/users/${userId}`);
    return response.data;
  }
};
