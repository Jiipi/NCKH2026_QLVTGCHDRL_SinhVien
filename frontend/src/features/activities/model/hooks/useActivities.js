import { useState, useEffect, useCallback, useMemo } from 'react';
import activitiesApi from '../../services/activitiesApi';

/**
 * useActivities - Hook quản lý danh sách hoạt động
 * 
 * @param {Object} options - Cấu hình
 * @param {string} options.mode - 'list' | 'my' | 'class' | 'admin'
 * @param {Object} options.initialFilters - Filters mặc định
 * @param {boolean} options.autoFetch - Tự động fetch khi mount (default: true)
 * @returns {Object} State và actions cho activities
 */
export function useActivities(options = {}) {
  const {
    mode = 'list',
    initialFilters = {},
    autoFetch = true,
  } = options;

  // State
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    status: '',
    semester: '',
    ...initialFilters,
  });

  // Derived state
  const totalPages = useMemo(() => {
    return Math.ceil(total / (filters.limit || 10));
  }, [total, filters.limit]);

  const isEmpty = useMemo(() => {
    return !loading && activities.length === 0;
  }, [loading, activities]);

  // API method based on mode
  const getApiMethod = useCallback(() => {
    switch (mode) {
      case 'my':
        return activitiesApi.getMyActivities.bind(activitiesApi);
      case 'class':
        return activitiesApi.getClassActivities.bind(activitiesApi);
      case 'admin':
        return activitiesApi.listAdminActivities.bind(activitiesApi);
      default:
        return activitiesApi.listActivities.bind(activitiesApi);
    }
  }, [mode]);

  // Fetch activities
  const fetchActivities = useCallback(async (customFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = { ...filters, ...customFilters };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const apiMethod = getApiMethod();
      const result = await apiMethod(params);

      if (result.success) {
        setActivities(result.data || []);
        setTotal(result.total || 0);
      } else {
        setError(result.error || 'Không thể tải danh sách hoạt động');
        setActivities([]);
        setTotal(0);
      }
    } catch (err) {
      setError(err.message || 'Lỗi không xác định');
      setActivities([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, getApiMethod]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 if filters change (except page itself)
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      type: '',
      status: '',
      semester: '',
      ...initialFilters,
    });
  }, [initialFilters]);

  // Pagination helpers
  const goToPage = useCallback((page) => {
    updateFilters({ page });
  }, [updateFilters]);

  const nextPage = useCallback(() => {
    if (filters.page < totalPages) {
      goToPage(filters.page + 1);
    }
  }, [filters.page, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (filters.page > 1) {
      goToPage(filters.page - 1);
    }
  }, [filters.page, goToPage]);

  // Refresh
  const refresh = useCallback(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Auto fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchActivities();
    }
  }, [filters, autoFetch, fetchActivities]);

  return {
    // Data
    activities,
    total,
    totalPages,
    isEmpty,
    
    // Loading/Error state
    loading,
    error,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // Pagination
    currentPage: filters.page,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: filters.page < totalPages,
    hasPrevPage: filters.page > 1,
    
    // Actions
    fetchActivities,
    refresh,
  };
}

export default useActivities;
