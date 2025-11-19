/**
 * Session Tracking Utilities
 * Client-side utilities for tracking user sessions and activity
 */

import http from '../api/http';

class SessionTracker {
  constructor() {
    this.tabId = this.getOrCreateTabId();
    this.heartbeatInterval = null;
    this.heartbeatIntervalMs = 2 * 60 * 1000; // 2 minutes
  }

  /**
   * Get or create unique tab ID
   */
  getOrCreateTabId() {
    let tabId = sessionStorage.getItem('tab_id');
    if (!tabId) {
      tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem('tab_id', tabId);
    }
    return tabId;
  }

  /**
   * Get tab ID
   */
  getTabId() {
    return this.tabId;
  }

  /**
   * Start heartbeat tracking
   */
  startHeartbeat() {
    // Clear existing interval if any
    this.stopHeartbeat();

    // Send initial heartbeat
    this.sendHeartbeat();

    // Set up interval
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatIntervalMs);

    console.log('[SessionTracker] Heartbeat started');
  }

  /**
   * Stop heartbeat tracking
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('[SessionTracker] Heartbeat stopped');
    }
  }

  /**
   * Send heartbeat to server
   */
  async sendHeartbeat() {
    try {
      await http.post('/core/sessions/heartbeat', null, {
        headers: { 'X-Tab-Id': this.tabId }
      }).catch(async (err) => {
        if (err?.response?.status === 404) {
          // Fallback to legacy path
          return http.post('/sessions/heartbeat', null, {
            headers: { 'X-Tab-Id': this.tabId }
          });
        }
        throw err;
      });
    } catch (error) {
      console.error('[SessionTracker] Heartbeat failed:', error);
    }
  }

  /**
   * Get active users
   */
  async getActiveUsers(minutes = 5) {
    try {
      const response = await http.get('/core/sessions/active-users', {
        params: { minutes },
        headers: { 'X-Tab-Id': this.tabId }
      }).catch(async (err) => {
        if (err?.response?.status === 404) {
          return http.get('/sessions/active-users', {
            params: { minutes },
            headers: { 'X-Tab-Id': this.tabId }
          });
        }
        throw err;
      });
      return response.data?.data || { userIds: [], userCodes: [], sessionCount: 0 };
    } catch (error) {
      console.error('[SessionTracker] Failed to get active users:', error);
      return { userIds: [], userCodes: [], sessionCount: 0 };
    }
  }

  /**
   * Get my sessions
   */
  async getMySessions(minutes = 5) {
    try {
      const response = await http.get('/core/sessions/my-sessions', {
        params: { minutes },
        headers: { 'X-Tab-Id': this.tabId }
      }).catch(async (err) => {
        if (err?.response?.status === 404) {
          return http.get('/sessions/my-sessions', {
            params: { minutes },
            headers: { 'X-Tab-Id': this.tabId }
          });
        }
        throw err;
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('[SessionTracker] Failed to get my sessions:', error);
      return [];
    }
  }

  /**
   * Get user activity status
   */
  async getUserStatus(userId) {
    try {
      const response = await http.get(`/core/sessions/status/${userId}`, {
        headers: { 'X-Tab-Id': this.tabId }
      }).catch(async (err) => {
        if (err?.response?.status === 404) {
          return http.get(`/sessions/status/${userId}`, {
            headers: { 'X-Tab-Id': this.tabId }
          });
        }
        throw err;
      });
      return response.data?.data || null;
    } catch (error) {
      console.error('[SessionTracker] Failed to get user status:', error);
      return null;
    }
  }

  /**
   * Logout and cleanup session
   */
  async logout() {
    try {
      await http.delete('/core/sessions/logout', {
        headers: { 'X-Tab-Id': this.tabId }
      }).catch(async (err) => {
        if (err?.response?.status === 404) {
          return http.delete('/sessions/logout', {
            headers: { 'X-Tab-Id': this.tabId }
          });
        }
        throw err;
      });
      this.stopHeartbeat();
      sessionStorage.removeItem('tab_id');
      console.log('[SessionTracker] Session cleaned up');
    } catch (error) {
      console.error('[SessionTracker] Logout cleanup failed:', error);
    }
  }

  /**
   * Set tab ID in HTTP headers for all requests
   */
  setupHttpInterceptor() {
    // Add tab ID to all requests
    http.interceptors.request.use((config) => {
      config.headers['X-Tab-Id'] = this.tabId;
      return config;
    }, (error) => {
      return Promise.reject(error);
    });
  }
}

// Create singleton instance
const sessionTracker = new SessionTracker();

export default sessionTracker;
