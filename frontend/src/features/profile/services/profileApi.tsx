/**
 * Profile API Service
 * Single Responsibility: Handle all profile-related API calls
 */

import http from '../../../shared/api/http';

const profileApi = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await http.get('/profile');
    return response.data?.data || null;
  },

  /**
   * Update profile
   */
  updateProfile: async (profileData) => {
    const response = await http.put('/profile', profileData);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwordData) => {
    const response = await http.put('/profile/password', passwordData);
    return response.data;
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await http.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Get user activity history
   */
  getActivityHistory: async (params = {}) => {
    const response = await http.get('/profile/activities', { params });
    return response.data?.data || [];
  }
};

export default profileApi;
