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

  getAdminOverview: async (semester) => {
    const response = await http.get('/core/admin/reports/overview', { params: { semester: semester || undefined } });
    return response.data?.data || { byStatus: [], topActivities: [], dailyRegs: [] };
  },

  exportAdminReport: async (kind, semester) => {
    const response = await http.get(`/core/admin/reports/export/${kind}`, {
      params: { semester: semester || undefined },
      responseType: 'arraybuffer'
    });
    return response.data;
  },

  /**
   * Get teacher reports data
   */
  getTeacherReports: async (params = {}) => {
    const response = await http.get('/teacher/reports', { params });
    return response.data?.data || {};
  },

  getTeacherStatistics: async (params = {}) => {
    const response = await http.get('/teacher/reports/statistics', { params });
    return response.data?.data || {};
  },

  exportTeacherReport: async (params = {}) => {
    const response = await http.get('/teacher/reports/export', {
      params,
      responseType: 'text'
    });
    return response.data;
  },

  /**
   * Get monitor reports data
   */
  getMonitorReports: async (params = {}) => {
    const response = await http.get('/core/monitor/reports', { params });
    return response.data?.data || {};
  },

  getClassReports: async (semester) => {
    const response = await http.get('/core/monitor/reports', { params: { semester } });
    return response.data?.data || null;
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
