/**
 * Settings API Service
 * Single Responsibility: Handle all settings-related API calls
 */

import http from '../../../shared/api/http';

const settingsApi = {
  /**
   * Get all settings
   */
  getSettings: async () => {
    const response = await http.get('/admin/settings');
    return response.data?.data || {};
  },

  /**
   * Update settings
   */
  updateSettings: async (settings) => {
    const response = await http.put('/admin/settings', settings);
    return response.data;
  },

  /**
   * Get system info
   */
  getSystemInfo: async () => {
    const response = await http.get('/admin/system-info');
    return response.data?.data || {};
  },

  /**
   * Clear cache
   */
  clearCache: async () => {
    const response = await http.post('/admin/cache/clear');
    return response.data;
  },

  /**
   * Get audit logs
   */
  getAuditLogs: async (params = {}) => {
    const response = await http.get('/admin/audit-logs', { params });
    return response.data?.data || { logs: [], total: 0 };
  }
};

export default settingsApi;
