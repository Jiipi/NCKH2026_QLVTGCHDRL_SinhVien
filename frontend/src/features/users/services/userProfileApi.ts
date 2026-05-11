import http from '../../../shared/api/http';

export const userProfileApi = {
  async getProfile() {
    const response = await http.get('/core/profile');
    return response?.data?.data || response?.data || {};
  },

  async getAuthProfile() {
    const response = await http.get('/auth/profile');
    return response?.data?.data || response?.data;
  },

  async getUsersProfile() {
    const response = await http.get('/users/profile');
    return response?.data?.data || response?.data || null;
  },

  async updateProfile(payload: Record<string, unknown>) {
    await http.put('/core/profile', payload);
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    await http.post('/auth/change-password', payload);
  }
};
