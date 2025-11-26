import { useState, useCallback } from 'react';
import activitiesApi from '../../services/activitiesApi';
import { useNotification } from '../../../../shared/contexts/NotificationContext';

/**
 * useActivityRegistration - Hook quản lý đăng ký hoạt động
 * 
 * @param {Object} options - Cấu hình
 * @param {Function} options.onSuccess - Callback khi thành công
 * @param {Function} options.onError - Callback khi lỗi
 * @returns {Object} State và actions cho registration
 */
export function useActivityRegistration(options = {}) {
  const { onSuccess, onError } = options;
  const { showSuccess, showError } = useNotification();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Register for activity
  const register = useCallback(async (activityId) => {
    if (!activityId) {
      const err = 'ID hoạt động không hợp lệ';
      setError(err);
      showError(err);
      return { success: false, error: err };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await activitiesApi.registerForActivity(activityId);

      if (result.success) {
        showSuccess('Đăng ký hoạt động thành công!');
        onSuccess?.(result.data);
      } else {
        const errMsg = result.error || 'Không thể đăng ký hoạt động';
        setError(errMsg);
        showError(errMsg);
        onError?.(errMsg);
      }
      return result;
    } catch (err) {
      const errMsg = err.message || 'Lỗi không xác định';
      setError(errMsg);
      showError(errMsg);
      onError?.(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError, onSuccess, onError]);

  // Cancel registration
  const cancel = useCallback(async (registrationId) => {
    if (!registrationId) {
      const err = 'ID đăng ký không hợp lệ';
      setError(err);
      showError(err);
      return { success: false, error: err };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await activitiesApi.cancelRegistration(registrationId);

      if (result.success) {
        showSuccess('Hủy đăng ký thành công!');
        onSuccess?.(null);
      } else {
        const errMsg = result.error || 'Không thể hủy đăng ký';
        setError(errMsg);
        showError(errMsg);
        onError?.(errMsg);
      }
      return result;
    } catch (err) {
      const errMsg = err.message || 'Lỗi không xác định';
      setError(errMsg);
      showError(errMsg);
      onError?.(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError, onSuccess, onError]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    register,
    cancel,
    clearError,
  };
}

export default useActivityRegistration;
