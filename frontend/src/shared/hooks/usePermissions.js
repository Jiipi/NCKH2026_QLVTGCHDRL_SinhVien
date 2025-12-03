/**
 * usePermissions Hook
 * Quản lý permissions của user và sync realtime từ backend
 * 
 * Features:
 * - Lấy permissions từ backend khi mount
 * - Polling mỗi 30s để cập nhật permissions
 * - Auto refresh khi nhận 403 error
 * - Provide hasPermission() function để check permissions
 * - Cache permissions PER USER để tránh conflict khi multi-tab với users khác nhau
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../api/http';
import sessionStorageManager from '../api/sessionStorageManager';

const POLLING_INTERVAL = 30000; // 30 seconds
const PERMISSIONS_STORAGE_KEY_PREFIX = 'user_permissions';

// Get cache key for current user session
const getPermissionsCacheKey = () => {
  const session = sessionStorageManager.getSession();
  const userId = session?.user?.id;
  const role = session?.role;
  if (userId && role) {
    return `${PERMISSIONS_STORAGE_KEY_PREFIX}_${userId}_${role}`;
  }
  // Fallback to tab-specific key để tránh conflict giữa các tabs
  return `${PERMISSIONS_STORAGE_KEY_PREFIX}_${sessionStorageManager.getTabId()}`;
};

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Lấy permissions từ localStorage (cache) - now per-user
  const getCachedPermissions = useCallback(() => {
    try {
      const cacheKey = getPermissionsCacheKey();
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Error reading cached permissions:', err);
    }
    return null;
  }, []);

  // Lưu permissions vào localStorage - now per-user
  const cachePermissions = useCallback((perms) => {
    try {
      const cacheKey = getPermissionsCacheKey();
      localStorage.setItem(cacheKey, JSON.stringify(perms));
    } catch (err) {
      console.error('Error caching permissions:', err);
    }
  }, []);

  // Fetch permissions từ backend
  const fetchPermissions = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const response = await axiosInstance.get('/api/auth/permissions');
      
      if (!mountedRef.current) return;

      if (response.data.success) {
        const newPermissions = response.data.data.permissions || [];
        setPermissions(newPermissions);
        cachePermissions(newPermissions);
        setError(null);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('Error fetching permissions:', err);
      setError(err.message);
      
      // Nếu bị 401, xóa cache và logout
      if (err.response?.status === 401) {
        const cacheKey = getPermissionsCacheKey();
        localStorage.removeItem(cacheKey);
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [cachePermissions]);

  // Kiểm tra permission
  const hasPermission = useCallback((requiredPermission) => {
    if (!requiredPermission) return true;
    return permissions.includes(requiredPermission);
  }, [permissions]);

  // Kiểm tra có ít nhất 1 permission
  const hasAnyPermission = useCallback((requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some(perm => permissions.includes(perm));
  }, [permissions]);

  // Kiểm tra có tất cả permissions
  const hasAllPermissions = useCallback((requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.every(perm => permissions.includes(perm));
  }, [permissions]);

  // Refresh permissions manually
  const refreshPermissions = useCallback(() => {
    return fetchPermissions(false);
  }, [fetchPermissions]);

  // Track current user for cache invalidation
  const userIdRef = useRef(null);

  // Setup polling và cache validation
  useEffect(() => {
    // Get current user ID from session
    const session = sessionStorageManager.getSession();
    const currentUserId = session?.user?.id;
    
    // Check if user changed (login with different account)
    const userChanged = userIdRef.current !== null && userIdRef.current !== currentUserId;
    userIdRef.current = currentUserId;
    
    // Load cached permissions ONLY if same user
    let cached = null;
    if (!userChanged) {
      cached = getCachedPermissions();
      if (cached) {
        setPermissions(cached);
        setLoading(false);
      }
    } else {
      // User changed - clear old permissions immediately
      console.log('[usePermissions] User changed, clearing cached permissions');
      setPermissions([]);
      setLoading(true);
    }

    // ALWAYS fetch fresh permissions to ensure accuracy
    fetchPermissions(cached === null || userChanged);

    // Start polling
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchPermissions(false);
      }
    }, POLLING_INTERVAL);

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPermissions, getCachedPermissions]);

  // Listen for storage changes (multi-tab sync) - now per-user
  useEffect(() => {
    const handleStorageChange = (e) => {
      const currentCacheKey = getPermissionsCacheKey();
      // Only sync if this is our user's permission cache
      if (e.key === currentCacheKey && e.newValue) {
        try {
          const newPerms = JSON.parse(e.newValue);
          setPermissions(newPerms);
        } catch (err) {
          console.error('Error syncing permissions from storage:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for login/session changes to refresh permissions
  // Only refresh when session changes from OTHER tabs (not current tab)
  useEffect(() => {
    let debounceTimer = null;
    const currentTabId = sessionStorageManager.getTabId();
    
    const handleSessionSync = (event) => {
      // Skip if event is from current tab (we already have latest data)
      const eventTabId = event?.detail?.tabId;
      if (eventTabId === currentTabId) {
        return;
      }
      
      // Debounce to avoid multiple rapid refreshes
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      debounceTimer = setTimeout(() => {
        console.log('[usePermissions] Session sync from other tab, refreshing permissions...');
        fetchPermissions(false); // Don't show loading for background refresh
      }, 500);
    };

    // Listen for custom session sync events
    window.addEventListener('tab_session_sync', handleSessionSync);
    
    return () => {
      window.removeEventListener('tab_session_sync', handleSessionSync);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions,
  };
};

export default usePermissions;
