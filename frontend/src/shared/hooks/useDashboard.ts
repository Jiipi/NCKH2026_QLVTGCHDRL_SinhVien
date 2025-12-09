/**
 * useDashboard Hook
 * Business Layer - Dashboard data hook for all roles
 */

import { useState, useCallback, useEffect } from 'react';
import { dashboardApi, StudentDashboard, TeacherDashboard, MonitorDashboard, AdminDashboard } from '../api/repositories';

export type DashboardData = StudentDashboard | TeacherDashboard | MonitorDashboard | AdminDashboard;

export interface UseDashboardOptions {
    role: 'student' | 'teacher' | 'monitor' | 'admin';
    autoFetch?: boolean;
}

export interface UseDashboardReturn {
    data: DashboardData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useDashboard(options: UseDashboardOptions): UseDashboardReturn {
    const { role, autoFetch = true } = options;

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let response: DashboardData;

            switch (role) {
                case 'student':
                    response = await dashboardApi.getStudentDashboard();
                    break;
                case 'teacher':
                    response = await dashboardApi.getTeacherDashboard();
                    break;
                case 'monitor':
                    response = await dashboardApi.getMonitorDashboard();
                    break;
                case 'admin':
                    response = await dashboardApi.getAdminDashboard();
                    break;
                default:
                    throw new Error(`Unknown role: ${role}`);
            }

            setData(response);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to fetch dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        if (autoFetch) {
            fetchDashboard();
        }
    }, [autoFetch, fetchDashboard]);

    return {
        data,
        loading,
        error,
        refetch: fetchDashboard,
    };
}

export default useDashboard;
