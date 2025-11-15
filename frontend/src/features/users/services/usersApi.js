import apiClient from '../../../shared/services/api/client';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Users API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

class UsersAPI {
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/admin/users', { params });
      const data = response.data?.data || response.data || {};
      return {
        success: true,
        data: data.users || [],
        pagination: data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    } catch (error) {
      return handleError(error);
    }
  }

  async getUserDetails(userId) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return { success: true, data: response.data?.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async getUserPoints(userId) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/points`);
      const data = response.data?.data || response.data || {};
      // Normalize points data structure
      let pointsArray = [];
      if (Array.isArray(data.details)) {
        pointsArray = data.details.map(d => ({ activity_name: d.name, date: d.date, points: d.points }));
      }
      return { success: true, data: pointsArray };
    } catch (error) {
      return handleError(error);
    }
  }

  async getRoles() {
    try {
      const response = await apiClient.get('/admin/roles');
      return { success: true, data: response.data?.data || response.data || [] };
    } catch (error) {
      return handleError(error);
    }
  }

  async getClasses() {
    try {
      const response = await apiClient.get('/admin/classes');
      return { success: true, data: response.data?.data || response.data || [] };
    } catch (error) {
      return handleError(error);
    }
  }

  async createUser(userData) {
    try {
      const response = await apiClient.post('/admin/users', userData);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, userData);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async deleteUser(userId) {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }
}

const usersApi = new UsersAPI();
export default usersApi;

