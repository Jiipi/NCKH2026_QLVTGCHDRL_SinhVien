/**
 * Settings API Service
 * Single Responsibility: Handle all settings-related API calls
 */

import http from '../../../shared/api/http';

// ============ SETTINGS TYPES ============
export interface SystemSettings {
  // General
  system_name?: string;
  system_description?: string;
  logo_url?: string;
  support_phone?: string;
  support_email?: string;
  // Email
  smtp_host?: string;
  smtp_port?: string | number;
  from_email?: string;
  from_name?: string;
  email_enabled?: boolean;
  // Notifications
  notify_new_activity?: boolean;
  notify_approval?: boolean;
  notify_deadline?: boolean;
  reminder_hours?: number;
  // Activities
  max_activity_points?: number;
  min_registration_hours?: number;
  auto_approve?: boolean;
  activity_rules?: string;
  // Users
  allow_registration?: boolean;
  default_role?: string;
  min_password_length?: number;
  session_timeout?: number;
  // Security
  enable_2fa?: boolean;
  force_https?: boolean;
  log_user_activity?: boolean;
  max_login_attempts?: number;
  lockout_duration?: number;
}

export interface SystemInfo {
  version?: string;
  uptime?: number;
  database_status?: string;
  memory_usage?: number;
  cpu_usage?: number;
}

export interface AuditLog {
  id: string;
  action: string;
  user_id?: string;
  timestamp: string;
  details?: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

const settingsApi = {
  /**
   * Get all settings
   */
  getSettings: async (): Promise<SystemSettings> => {
    const response = await http.get('/admin/settings');
    return response.data?.data || {};
  },

  /**
   * Update settings
   */
  updateSettings: async (settings: SystemSettings): Promise<SystemSettings> => {
    const response = await http.put('/admin/settings', settings);
    return response.data;
  },

  /**
   * Get system info
   */
  getSystemInfo: async (): Promise<SystemInfo> => {
    const response = await http.get('/admin/system-info');
    return response.data?.data || {};
  },

  /**
   * Clear cache
   */
  clearCache: async (): Promise<{ success: boolean; message?: string }> => {
    const response = await http.post('/admin/cache/clear');
    return response.data;
  },

  /**
   * Get audit logs
   */
  getAuditLogs: async (params: AuditLogsParams = {}): Promise<AuditLogsResponse> => {
    const response = await http.get('/admin/audit-logs', { params });
    return response.data?.data || { logs: [], total: 0 };
  }
};

export default settingsApi;
