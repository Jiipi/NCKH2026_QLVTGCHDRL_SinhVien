import { useState, useEffect, useCallback, useMemo } from 'react';
import activitiesApi from '../services/activitiesApi';
import { useNotification } from '../../../contexts/NotificationContext';

/**
 * Custom hook to manage state and logic for the main 'Activities List' page.
 * @param {string} initialSemester - The initial semester to load activities for.
 * @returns {object} - State and handlers for the component.
 */
export function useActivitiesList(initialSemester) {
  const { showSuccess, showError, confirm } = useNotification();

  // Core data state
  const [items, setItems] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter and pagination state
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ type: '', status: '', from: '', to: '' });
  const [semester, setSemester] = useState(initialSemester);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  /**
   * Fetches the list of activities from the API based on current filters.
   */
  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      q: query || undefined,
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      sort: 'ngay_bd',
      order: 'asc',
      semester: semester || undefined,
    };

    // Remove empty params
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    const result = await activitiesApi.listActivities(params);

    if (result.success) {
      setItems(result.data);
      setPagination(prev => ({ ...prev, total: result.total }));
    } else {
      setItems([]);
      setError(result.error || 'Lỗi tải dữ liệu hoạt động.');
      setPagination(prev => ({ ...prev, total: 0 }));
    }

    setLoading(false);
  }, [query, filters, pagination.page, pagination.limit, semester]);

  /**
   * Fetches the list of available activity types for filtering.
   */
  const loadActivityTypes = useCallback(async () => {
    const result = await activitiesApi.getActivityTypes();
    if (result.success) {
      setActivityTypes(result.data);
    }
  }, []);

  // Initial and dependency-based data loading
  useEffect(() => {
    loadActivities();
  }, [loadActivities]); // This hook is debounced by its own dependencies

  useEffect(() => {
    loadActivityTypes();
  }, [loadActivityTypes]);

  /**
   * Handles user registration for an activity.
   */
  const handleRegister = async (activityId, activityName) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận đăng ký',
      message: `Bạn có chắc muốn đăng ký tham gia "${activityName}"?`,
    });

    if (!isConfirmed) return;

    const result = await activitiesApi.registerForActivity(activityId);

    if (result.success) {
      showSuccess('Đăng ký thành công!');
      loadActivities(); // Refresh the list to show updated status
    } else {
      showError(result.error || 'Đăng ký thất bại.');
    }
  };
  
  // Reset page to 1 when filters change
  useEffect(() => {
    setPagination(p => ({ ...p, page: 1 }));
  }, [query, filters, semester]);

  return {
    // State
    loading,
    error,
    items,
    activityTypes,
    pagination,
    query,
    filters,
    semester,

    // Handlers
    setQuery,
    setFilters,
    setSemester,
    setPagination,
    handleRegister,
    refresh: loadActivities,
  };
}

