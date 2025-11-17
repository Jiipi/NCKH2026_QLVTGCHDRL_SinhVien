import { useState, useEffect, useCallback, useMemo } from 'react';
import activitiesApi from '../services/activitiesApi';
import { useNotification } from '../../../contexts/NotificationContext';

/**
 * Custom hook to manage state and logic for the 'My Activities' page.
 * @param {string} initialSemester - The initial semester to load activities for.
 * @returns {object} - State and handlers for the component.
 */
export function useMyActivities(initialSemester) {
  const { showSuccess, showError, confirm } = useNotification();

  // Core data state
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI and filter state
  const [semester, setSemester] = useState(initialSemester);
  const [activeTab, setActiveTab] = useState('joined'); // 'pending', 'approved', 'joined', 'rejected'
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ type: '', from: '', to: '' });
  const [activityTypes, setActivityTypes] = useState([]);

  /**
   * Fetches the user's registered activities from the API.
   */
  const loadMyActivities = useCallback(async () => {
    setLoading(true);
    setError('');

    // Pass semester directly without conversion
    const params = semester ? { semester } : {};

    const result = await activitiesApi.getMyActivities(params);

    if (result.success) {
      setAllActivities(result.data);
    } else {
      setError(result.error || 'Lỗi tải dữ liệu hoạt động.');
    }

    setLoading(false);
  }, [semester]); // Removed parseSemesterToLegacy from dependencies

  /**
   * Fetches the list of available activity types for filtering.
   */
  const loadActivityTypes = useCallback(async () => {
    const result = await activitiesApi.getActivityTypes();
    if (result.success) {
      setActivityTypes(result.data);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadMyActivities();
    loadActivityTypes();
  }, [loadMyActivities, loadActivityTypes]);

  /**
   * Handles the cancellation of an activity registration.
   */
  const handleCancelRegistration = async (registrationId, activityName) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận hủy đăng ký',
      message: `Bạn có chắc muốn hủy đăng ký hoạt động "${activityName}"?`,
    });

    if (!isConfirmed) return;

    const result = await activitiesApi.cancelRegistration(registrationId);

    if (result.success) {
      showSuccess('Hủy đăng ký thành công!');
      loadMyActivities(); // Refresh the list
    } else {
      showError(result.error || 'Hủy đăng ký thất bại.');
    }
  };

  /**
   * Memoized, categorized activities based on their registration status.
   */
  const categorizedActivities = useMemo(() => {
    const pending = [];
    const approved = [];
    const joined = [];
    const rejected = [];

    for (const activity of allActivities) {
      const status = (activity.trang_thai_dk || '').toLowerCase();
      if (status === 'cho_duyet') pending.push(activity);
      else if (status === 'da_duyet') approved.push(activity);
      else if (status === 'da_tham_gia') joined.push(activity);
      else if (status === 'tu_choi') rejected.push(activity);
    }

    return { pending, approved, joined, rejected };
  }, [allActivities]);

  /**
   * Memoized, filtered activities for the currently active tab.
   */
  const filteredItems = useMemo(() => {
    let items = categorizedActivities[activeTab] || [];

    // Apply search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      items = items.filter(activity => {
        const activityData = activity.hoat_dong || activity;
        return (activityData.ten_hd || '').toLowerCase().includes(lowerQuery);
      });
    }

    // Apply type filter
    if (filters.type) {
      items = items.filter(activity => {
        const activityData = activity.hoat_dong || activity;
        const typeName = activityData.loai_hd?.ten_loai_hd || '';
        return typeName === filters.type;
      });
    }

    // Apply date filters
    if (filters.from) {
      const fromDate = new Date(filters.from);
      items = items.filter(activity => {
        const activityData = activity.hoat_dong || activity;
        return activityData.ngay_bd && new Date(activityData.ngay_bd) >= fromDate;
      });
    }
    if (filters.to) {
      const toDate = new Date(filters.to);
      items = items.filter(activity => {
        const activityData = activity.hoat_dong || activity;
        return activityData.ngay_bd && new Date(activityData.ngay_bd) <= toDate;
      });
    }

    return items;
  }, [categorizedActivities, activeTab, query, filters]);

  return {
    // State
    loading,
    error,
    semester,
    activeTab,
    query,
    filters,
    activityTypes,
    categorizedActivities,
    filteredItems,

    // Handlers
    setSemester,
    setActiveTab,
    setQuery,
    setFilters,
    handleCancelRegistration,
    refresh: loadMyActivities,
  };
}

