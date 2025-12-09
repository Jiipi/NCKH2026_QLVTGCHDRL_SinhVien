/**
 * useActivityRegistration Hook - TypeScript Version
 * Business Layer - Activity registration management
 */

import { useState, useCallback } from 'react';
import { activityApi } from '../../../../shared/api/repositories';
import { useNotification } from '../../../../shared/contexts/NotificationContext';

// ============ TYPES ============
export interface UseActivityRegistrationOptions {
    onSuccess?: (data?: unknown) => void;
    onError?: (error: string) => void;
}

export interface UseActivityRegistrationReturn {
    loading: boolean;
    error: string | null;
    register: (activityId: string) => Promise<{ success: boolean; error?: string }>;
    cancel: (activityId: string) => Promise<{ success: boolean; error?: string }>;
    clearError: () => void;
}

/**
 * useActivityRegistration - Hook quản lý đăng ký hoạt động
 */
export function useActivityRegistration(
    options: UseActivityRegistrationOptions = {}
): UseActivityRegistrationReturn {
    const { onSuccess, onError } = options;
    const { showSuccess, showError } = useNotification();

    // State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Register for activity
    const register = useCallback(async (
        activityId: string
    ): Promise<{ success: boolean; error?: string }> => {
        if (!activityId) {
            const err = 'ID hoạt động không hợp lệ';
            setError(err);
            showError(err);
            return { success: false, error: err };
        }

        setLoading(true);
        setError(null);

        try {
            await activityApi.registerActivity(activityId);
            showSuccess('Đăng ký hoạt động thành công!');
            onSuccess?.();
            return { success: true };
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Không thể đăng ký hoạt động';
            setError(errMsg);
            showError(errMsg);
            onError?.(errMsg);
            return { success: false, error: errMsg };
        } finally {
            setLoading(false);
        }
    }, [showSuccess, showError, onSuccess, onError]);

    // Cancel registration
    const cancel = useCallback(async (
        activityId: string
    ): Promise<{ success: boolean; error?: string }> => {
        if (!activityId) {
            const err = 'ID hoạt động không hợp lệ';
            setError(err);
            showError(err);
            return { success: false, error: err };
        }

        setLoading(true);
        setError(null);

        try {
            await activityApi.cancelRegistration(activityId);
            showSuccess('Hủy đăng ký thành công!');
            onSuccess?.(null);
            return { success: true };
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Không thể hủy đăng ký';
            setError(errMsg);
            showError(errMsg);
            onError?.(errMsg);
            return { success: false, error: errMsg };
        } finally {
            setLoading(false);
        }
    }, [showSuccess, showError, onSuccess, onError]);

    // Clear error
    const clearError = useCallback((): void => {
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
