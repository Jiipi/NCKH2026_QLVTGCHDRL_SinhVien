/**
 * usePermissions Hook
 * Quản lý permissions của user và sync realtime từ backend
 * 
 * Features:
 * - Lấy permissions từ backend khi mount
 * - Polling mỗi 30s để cập nhật permissions
 * - Auto refresh khi nhận 403 error
 * - Provide hasPermission() function để check permissions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../api/http';

const POLLING_INTERVAL = 30000; // 30 seconds
const PERMISSIONS_STORAGE_KEY = 'user_permissions';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Lấy permissions từ localStorage (cache)
  const getCachedPermissions = useCallback(() => {
    try {
      const cached = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Error reading cached permissions:', err);
    }
    return null;
  }, []);

  // Lưu permissions vào localStorage
  const cachePermissions = useCallback((perms) => {
    try {
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(perms));
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
        localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
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

  // Setup polling
  useEffect(() => {
    // Load cached permissions immediately
    const cached = getCachedPermissions();
    if (cached) {
      setPermissions(cached);
      setLoading(false);
    }

    // Fetch fresh permissions
    fetchPermissions(cached === null);

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

  // Listen for storage changes (multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === PERMISSIONS_STORAGE_KEY && e.newValue) {
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
