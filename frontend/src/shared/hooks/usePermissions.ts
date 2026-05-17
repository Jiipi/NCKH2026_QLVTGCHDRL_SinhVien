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

const PERMISSION_ALIASES: Record<string, string[]> = {
  'activities.write': ['activities.create', 'activities.update', 'activities.manage'],
  'activities.create': ['activities.write', 'activities.manage'],
  'activities.update': ['activities.write', 'activities.manage'],
  'activities.read': ['activities.view'],
  'activities.view': ['activities.read'],
  'registrations.write': ['registrations.register', 'registrations.approve', 'registrations.reject', 'registrations.manage'],
  'registrations.read': ['registrations.view'],
  'attendance.write': ['attendance.mark', 'attendance.checkin', 'attendance.manage'],
  'attendance.read': ['attendance.view'],
  'reports.read': ['reports.view'],
  'notifications.write': ['notifications.create', 'notifications.manage'],
  'notifications.read': ['notifications.view'],
  'students.read': ['students.view'],
  'classmates.read': ['classmates.view'],
  'profile.read': ['profile.view'],
  'scores.read': ['points.read', 'points.view_own', 'points.view_all'],
  'activityTypes.write': ['activityTypes.create', 'activityTypes.update', 'activityTypes.manage'],
  'activityTypes.read': ['activityTypes.view'],
};

/**
 * Permission type
 */
export type Permission = string;

/**
 * usePermissions return type
 */
export interface UsePermissionsReturn {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  hasPermission: (requiredPermission: Permission | null | undefined) => boolean;
  hasAnyPermission: (requiredPermissions: Permission[] | null | undefined) => boolean;
  hasAllPermissions: (requiredPermissions: Permission[] | null | undefined) => boolean;
  refreshPermissions: () => Promise<void>;
}

// Get cache key for current user session
const getPermissionsCacheKey = (): string => {
  const session = sessionStorageManager.getSession();
  const userId = session?.user?.id;
  const role = session?.role;
  if (userId && role) {
    return `${PERMISSIONS_STORAGE_KEY_PREFIX}_${userId}_${role}`;
  }
  // Fallback to tab-specific key để tránh conflict giữa các tabs
  return `${PERMISSIONS_STORAGE_KEY_PREFIX}_${sessionStorageManager.getTabId()}`;
};

export const usePermissions = (): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Lấy permissions từ localStorage (cache) - now per-user
  const getCachedPermissions = useCallback((): Permission[] | null => {
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
  const cachePermissions = useCallback((perms: Permission[]) => {
    try {
      const cacheKey = getPermissionsCacheKey();
      localStorage.setItem(cacheKey, JSON.stringify(perms));
    } catch (err) {
      console.error('Error caching permissions:', err);
    }
  }, []);

  // Fetch permissions từ backend
  const fetchPermissions = useCallback(async (showLoading: boolean = true) => {
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
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      
      const error = err as Error & { response?: { status: number } };
      console.error('Error fetching permissions:', error);
      setError(error.message);
      
      // Nếu bị 401, xóa cache và logout
      if (error.response?.status === 401) {
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

  /**
   * Kiểm tra một permission có match với danh sách permissions của user hay không
   * Hỗ trợ:
   * - Wildcard `*` (user có tất cả quyền)
   * - Resource wildcard `users.*` (user có tất cả quyền của resource đó)
   * - Exact match
   */
  const checkSinglePermission = useCallback((requiredPermission: Permission): boolean => {
    // 1. Kiểm tra wildcard (admin có tất cả)
    if (permissions.includes('*')) return true;

    // 2. Kiểm tra exact match
    if (permissions.includes(requiredPermission)) return true;

    // 3. Kiểm tra resource wildcard (ví dụ: users.*)
    const [resource] = requiredPermission.split('.');
    if (resource && permissions.includes(`${resource}.*`)) return true;

    const aliases = PERMISSION_ALIASES[requiredPermission] || [];
    if (aliases.some(alias => permissions.includes(alias))) return true;

    return false;
  }, [permissions]);

  // Kiểm tra permission
  const hasPermission = useCallback((requiredPermission: Permission | null | undefined): boolean => {
    if (!requiredPermission) return true;
    return checkSinglePermission(requiredPermission);
  }, [checkSinglePermission]);

  // Kiểm tra có ít nhất 1 permission
  const hasAnyPermission = useCallback((requiredPermissions: Permission[] | null | undefined): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some(perm => checkSinglePermission(perm));
  }, [checkSinglePermission]);

  // Kiểm tra có tất cả permissions
  const hasAllPermissions = useCallback((requiredPermissions: Permission[] | null | undefined): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.every(perm => checkSinglePermission(perm));
  }, [checkSinglePermission]);

  // Refresh permissions manually
  const refreshPermissions = useCallback(() => {
    return fetchPermissions(false);
  }, [fetchPermissions]);

  // Track current user for cache invalidation
  const userIdRef = useRef<string | number | null | undefined>(null);

  // Setup polling và cache validation
  useEffect(() => {
    // Get current user ID from session
    const session = sessionStorageManager.getSession();
    const currentUserId = session?.user?.id;
    
    // Check if user changed (login with different account)
    const userChanged = userIdRef.current !== null && userIdRef.current !== currentUserId;
    userIdRef.current = currentUserId;
    
    // Load cached permissions ONLY if same user
    let cached: Permission[] | null = null;
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
    const handleStorageChange = (e: StorageEvent) => {
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
    let debounceTimer: NodeJS.Timeout | null = null;
    const currentTabId = sessionStorageManager.getTabId();
    
    const handleSessionSync = (event: CustomEvent<{ tabId?: string }>) => {
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
    window.addEventListener('tab_session_sync', handleSessionSync as EventListener);
    
    return () => {
      window.removeEventListener('tab_session_sync', handleSessionSync as EventListener);
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
