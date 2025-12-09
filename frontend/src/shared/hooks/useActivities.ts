/**
 * useActivities Hook
 * Business Layer - Activity operations hook
 * DÙNG CHUNG cho: Admin, Teacher, Student, Monitor
 */

import { useState, useCallback, useEffect } from 'react';
import { activityApi } from '../api/repositories';
import type { Activity, GetActivitiesParams, PaginatedResponse } from '../types';

export interface UseActivitiesOptions {
    autoFetch?: boolean;
    initialParams?: GetActivitiesParams;
}

export interface UseActivitiesReturn {
    // State
    activities: Activity[];
    pagination: PaginatedResponse<Activity>['pagination'] | null;
    loading: boolean;
    error: Error | null;

    // Actions
    fetchActivities: (params?: GetActivitiesParams) => Promise<void>;
    refetch: () => Promise<void>;
    createActivity: typeof activityApi.createActivity;
    updateActivity: typeof activityApi.updateActivity;
    deleteActivity: (id: string) => Promise<void>;
    approveActivity: typeof activityApi.approveActivity;
    rejectActivity: typeof activityApi.rejectActivity;
    registerActivity: typeof activityApi.registerActivity;
    cancelRegistration: typeof activityApi.cancelRegistration;
}

export function useActivities(options: UseActivitiesOptions = {}): UseActivitiesReturn {
    const { autoFetch = false, initialParams } = options;

    const [activities, setActivities] = useState<Activity[]>([]);
    const [pagination, setPagination] = useState<PaginatedResponse<Activity>['pagination'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [currentParams, setCurrentParams] = useState<GetActivitiesParams | undefined>(initialParams);

    const fetchActivities = useCallback(async (params?: GetActivitiesParams) => {
        setLoading(true);
        setError(null);
        const fetchParams = params || currentParams;
        setCurrentParams(fetchParams);

        try {
            const response = await activityApi.getActivities(fetchParams);
            setActivities(response.items || []);
            setPagination(response.pagination || null);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to fetch activities:', err);
        } finally {
            setLoading(false);
        }
    }, [currentParams]);

    const refetch = useCallback(() => fetchActivities(currentParams), [fetchActivities, currentParams]);

    const deleteActivity = useCallback(async (id: string) => {
        await activityApi.deleteActivity(id);
        // Remove from local state
        setActivities((prev: Activity[]) => prev.filter((a: Activity) => a.id !== id));
    }, []);

    // Auto fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchActivities(initialParams);
        }
    }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        activities,
        pagination,
        loading,
        error,
        fetchActivities,
        refetch,
        createActivity: activityApi.createActivity.bind(activityApi),
        updateActivity: activityApi.updateActivity.bind(activityApi),
        deleteActivity,
        approveActivity: activityApi.approveActivity.bind(activityApi),
        rejectActivity: activityApi.rejectActivity.bind(activityApi),
        registerActivity: activityApi.registerActivity.bind(activityApi),
        cancelRegistration: activityApi.cancelRegistration.bind(activityApi),
    };
}

export default useActivities;
