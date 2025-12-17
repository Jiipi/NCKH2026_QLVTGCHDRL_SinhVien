/**
 * Reports API Service
 * Single Responsibility: Handle all reports-related API calls
 */

import http from '../../../shared/api/http';

const reportsApi = {
  /**
   * Get admin reports data
   */
  getAdminReports: async (params = {}) => {
    const response = await http.get('/admin/reports', { params });
    return response.data?.data || {};
  },

  /**
   * Get teacher reports data
   */
  getTeacherReports: async (params = {}) => {
    const response = await http.get('/teacher/reports', { params });
    return response.data?.data || {};
  },

  /**
   * Get monitor reports data
   */
  getMonitorReports: async (params = {}) => {
    const response = await http.get('/monitor/reports', { params });
    return response.data?.data || {};
  },

  /**
   * Export report to Excel/PDF
   */
  exportReport: async (type, params = {}) => {
    const response = await http.get(`/reports/export/${type}`, { 
      params,
      responseType: 'blob' 
    });
    return response.data;
  },

  /**
   * Get activity statistics
   */
  getActivityStatistics: async (params = {}) => {
    const response = await http.get('/reports/activities', { params });
    return response.data?.data || {};
  },

  /**
   * Get student participation statistics
   */
  getParticipationStatistics: async (params = {}) => {
    const response = await http.get('/reports/participation', { params });
    return response.data?.data || {};
  }
};

export default reportsApi;
