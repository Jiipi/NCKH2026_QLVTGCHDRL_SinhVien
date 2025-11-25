/**
 * Monitor Class Management Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho quản lý lớp
 */

import { useState, useEffect, useCallback } from 'react';
import { monitorClassManagementApi } from '../../services/monitorClassManagementApi';

/**
 * Hook quản lý lớp
 */
export function useMonitorClassManagement() {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business logic: Load classes
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await monitorClassManagementApi.list();

      if (result.success) {
        setClassesData(result.data || []);
      } else {
        console.error('[useMonitorClassManagement] Load error:', result.error);
        setError(result.error || 'Không thể tải danh sách lớp');
        setClassesData([]);
      }
    } catch (err) {
      console.error('[useMonitorClassManagement] Load error:', err);
      setError(err?.message || 'Không thể tải danh sách lớp');
      setClassesData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Business logic: Refresh
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    // Data
    classes: classesData,
    
    // State
    loading,
    error,
    
    // Actions
    refresh,
    loadData
  };
}

