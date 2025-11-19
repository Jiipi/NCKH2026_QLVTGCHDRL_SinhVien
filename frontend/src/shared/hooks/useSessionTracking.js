/**
 * useSessionTracking Hook
 * React hook for session tracking and activity monitoring
 */

import { useEffect, useState } from 'react';
import sessionTracker from '../lib/sessionTracker';

export function useSessionTracking(enabled = true) {
  const [activeUsers, setActiveUsers] = useState({
    userIds: [],
    userCodes: [],
    sessionCount: 0
  });
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Setup HTTP interceptor to add tab ID to all requests
    sessionTracker.setupHttpInterceptor();

    // Start heartbeat
    sessionTracker.startHeartbeat();
    setIsTracking(true);

    // Cleanup on unmount
    return () => {
      sessionTracker.stopHeartbeat();
      setIsTracking(false);
    };
  }, [enabled]);

  /**
   * Refresh active users list
   */
  const refreshActiveUsers = async (minutes = 5) => {
    const users = await sessionTracker.getActiveUsers(minutes);
    setActiveUsers(users);
    return users;
  };

  /**
   * Check if a user is active
   */
  const isUserActive = (userId, userCode) => {
    if (userId && activeUsers.userIds.includes(userId)) {
      return true;
    }
    if (userCode && activeUsers.userCodes.includes(userCode)) {
      return true;
    }
    return false;
  };

  /**
   * Get user status
   */
  const getUserStatus = async (userId) => {
    return await sessionTracker.getUserStatus(userId);
  };

  /**
   * Get my sessions
   */
  const getMySessions = async (minutes = 5) => {
    return await sessionTracker.getMySessions(minutes);
  };

  /**
   * Logout and cleanup
   */
  const logout = async () => {
    await sessionTracker.logout();
  };

  return {
    isTracking,
    activeUsers,
    refreshActiveUsers,
    isUserActive,
    getUserStatus,
    getMySessions,
    logout,
    tabId: sessionTracker.getTabId()
  };
}

export default useSessionTracking;
