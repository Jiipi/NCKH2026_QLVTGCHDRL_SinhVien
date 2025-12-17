/**
 * Semesters API Service
 * Single Responsibility: Handle all semesters-related API calls
 */

import http from '../../../shared/api/http';

const semestersApi = {
  /**
   * Get all semesters
   */
  getSemesters: async () => {
    const response = await http.get('/semesters');
    return response.data?.data || [];
  },

  /**
   * Get current/active semester
   */
  getCurrentSemester: async () => {
    const response = await http.get('/semesters/current');
    return response.data?.data || null;
  },

  /**
   * Create new semester
   */
  createSemester: async (semesterData) => {
    const response = await http.post('/admin/semesters', semesterData);
    return response.data;
  },

  /**
   * Update semester
   */
  updateSemester: async (semesterId, semesterData) => {
    const response = await http.put(`/admin/semesters/${semesterId}`, semesterData);
    return response.data;
  },

  /**
   * Delete semester
   */
  deleteSemester: async (semesterId) => {
    const response = await http.delete(`/admin/semesters/${semesterId}`);
    return response.data;
  },

  /**
   * Set semester as active
   */
  setActiveSemester: async (semesterId) => {
    const response = await http.patch(`/admin/semesters/${semesterId}/activate`);
    return response.data;
  },

  /**
   * Lock/Unlock semester
   */
  toggleSemesterLock: async (semesterId, locked) => {
    const response = await http.patch(`/admin/semesters/${semesterId}/lock`, { locked });
    return response.data;
  }
};

export default semestersApi;
