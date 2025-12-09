/**
 * useActivityDetail Hook - TypeScript Version
 * Business Layer - Activity detail management
 */

import { useState, useEffect, useCallback } from 'react';
import { activityApi } from '../../../../shared/api/repositories';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import type { Activity, RegistrationStatus } from '../../../../shared/types';

// ============ TYPES ============
export interface UseActivityDetailOptions {
    autoFetch?: boolean;
}

export interface UseActivityDetailReturn {
    // Data
    activity: Activity | null;

    // Loading/Error state
    loading: boolean;
    error: string | null;
    actionLoading: boolean;

    // Derived state
    isRegistered: boolean;
    registrationStatus: RegistrationStatus | null;
    canRegister: boolean;

    // Actions
    fetchActivity: () => Promise<void>;
    register: () => Promise<{ success: boolean; error?: string }>;
    cancelRegistration: () => Promise<{ success: boolean; error?: string }>;
    refresh: () => Promise<void>;
}

/**
 * useActivityDetail - Hook quản lý chi tiết hoạt động
 * 
 * @param activityId - ID hoạt động
 * @param options - Cấu hình
 * @returns State và actions cho activity detail
 */
export function useActivityDetail(
    activityId: string | undefined,
    options: UseActivityDetailOptions = {}
): UseActivityDetailReturn {
    const { autoFetch = true } = options;
    const { showSuccess, showError } = useNotification();

    // State
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch activity details
    const fetchActivity = useCallback(async (): Promise<void> => {
        if (!activityId) {
            setError('ID hoạt động không hợp lệ');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await activityApi.getActivityById(activityId);
            setActivity(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải chi tiết hoạt động';
            setError(errorMessage);
            setActivity(null);
        } finally {
            setLoading(false);
        }
    }, [activityId]);

    // Register for activity
    const register = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        if (!activityId) {
            return { success: false, error: 'ID hoạt động không hợp lệ' };
        }

        setActionLoading(true);
        try {
            await activityApi.registerActivity(activityId);
            showSuccess('Đăng ký hoạt động thành công!');
            // Refresh activity details
            await fetchActivity();
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể đăng ký hoạt động';
            showError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setActionLoading(false);
        }
    }, [activityId, fetchActivity, showSuccess, showError]);

    // Cancel registration
    const cancelRegistration = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        if (!activityId) {
            return { success: false, error: 'ID hoạt động không hợp lệ' };
        }

        setActionLoading(true);
        try {
            await activityApi.cancelRegistration(activityId);
            showSuccess('Hủy đăng ký thành công!');
            // Refresh activity details
            await fetchActivity();
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể hủy đăng ký';
            showError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setActionLoading(false);
        }
    }, [activityId, fetchActivity, showSuccess, showError]);

    // Derived state
    const isRegistered = activity?.is_registered || false;
    const registrationStatus = activity?.registration_status || activity?.trang_thai_dk || null;
    const canRegister = activity?.trang_thai === 'da_duyet' &&
        !isRegistered &&
        (activity?.han_dk ? new Date(activity.han_dk) > new Date() : true);

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
