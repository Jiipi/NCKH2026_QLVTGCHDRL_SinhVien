import { useState, useEffect, useCallback } from 'react';
import activitiesApi from '../../services/activitiesApi';
import { useNotification } from '../../../../shared/contexts/NotificationContext';

/**
 * useActivityDetail - Hook quản lý chi tiết hoạt động
 * 
 * @param {string} activityId - ID hoạt động
 * @param {Object} options - Cấu hình
 * @param {boolean} options.autoFetch - Tự động fetch khi mount (default: true)
 * @returns {Object} State và actions cho activity detail
 */
export function useActivityDetail(activityId, options = {}) {
  const { autoFetch = true } = options;
  const { showSuccess, showError } = useNotification();

  // State
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch activity details
  const fetchActivity = useCallback(async () => {
    if (!activityId) {
      setError('ID hoạt động không hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await activitiesApi.getActivityDetails(activityId);

      if (result.success) {
        setActivity(result.data);
      } else {
        setError(result.error || 'Không thể tải chi tiết hoạt động');
        setActivity(null);
      }
    } catch (err) {
      setError(err.message || 'Lỗi không xác định');
      setActivity(null);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  // Register for activity
  const register = useCallback(async () => {
    if (!activityId) return { success: false, error: 'ID hoạt động không hợp lệ' };

    setActionLoading(true);
    try {
      const result = await activitiesApi.registerForActivity(activityId);

      if (result.success) {
        showSuccess('Đăng ký hoạt động thành công!');
        // Refresh activity details
        await fetchActivity();
      } else {
        showError(result.error || 'Không thể đăng ký hoạt động');
      }
      return result;
    } catch (err) {
      showError(err.message || 'Lỗi không xác định');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [activityId, fetchActivity, showSuccess, showError]);

  // Cancel registration
  const cancelRegistration = useCallback(async (registrationId) => {
    if (!registrationId) return { success: false, error: 'ID đăng ký không hợp lệ' };

    setActionLoading(true);
    try {
      const result = await activitiesApi.cancelRegistration(registrationId);

      if (result.success) {
        showSuccess('Hủy đăng ký thành công!');
        // Refresh activity details
        await fetchActivity();
      } else {
        showError(result.error || 'Không thể hủy đăng ký');
      }
      return result;
    } catch (err) {
      showError(err.message || 'Lỗi không xác định');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [fetchActivity, showSuccess, showError]);

  // Derived state
  const isRegistered = activity?.is_registered || false;
  const registrationStatus = activity?.registration_status || activity?.trang_thai_dk || null;
  const canRegister = activity?.trang_thai === 'da_duyet' && 
    !isRegistered && 
    new Date(activity?.han_dk) > new Date();

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch && activityId) {
      fetchActivity();
    }
  }, [activityId, autoFetch, fetchActivity]);

  return {
    // Data
    activity,
    
    // Loading/Error state
    loading,
    error,
    actionLoading,
    
    // Derived state
    isRegistered,
    registrationStatus,
    canRegister,
    
    // Actions
    fetchActivity,
    register,
    cancelRegistration,
    refresh: fetchActivity,
  };
}

export default useActivityDetail;
