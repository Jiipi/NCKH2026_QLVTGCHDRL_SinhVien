/**
 * useDashboard Hook (Refactored)
 * Uses useAsyncData to eliminate duplicate loading/error state
 * 
 * BEFORE: ~70 lines with duplicate state management
 * AFTER: ~30 lines - 57% reduction!
 */

import { useAsyncData } from '../../core';
import { dashboardApi, StudentDashboard, TeacherDashboard, MonitorDashboard, AdminDashboard } from '../api/repositories';

export type DashboardData = StudentDashboard | TeacherDashboard | MonitorDashboard | AdminDashboard;
export type DashboardRole = 'student' | 'teacher' | 'monitor' | 'admin';

export interface UseDashboardOptions {
  role: DashboardRole;
  autoFetch?: boolean;
}

/**
 * Fetch dashboard data based on role
 */
async function fetchDashboard(role: DashboardRole): Promise<DashboardData> {
  switch (role) {
    case 'student':
      return dashboardApi.getStudentDashboard();
    case 'teacher':
      return dashboardApi.getTeacherDashboard();
    case 'monitor':
      return dashboardApi.getMonitorDashboard();
    case 'admin':
      return dashboardApi.getAdminDashboard();
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}

/**
 * Dashboard hook using core useAsyncData
 * All loading/error state is handled automatically
 */
export function useDashboardRefactored(options: UseDashboardOptions) {
  const { role, autoFetch = true } = options;

  // All state management is handled by useAsyncData!
  const result = useAsyncData(
    () => fetchDashboard(role),
    [role],
    { autoFetch }
  );

  return {
    data: result.data,
    loading: result.loading,
    error: result.error ? new Error(result.error) : null,
    refetch: result.refetch
  };
}

export default useDashboardRefactored;
