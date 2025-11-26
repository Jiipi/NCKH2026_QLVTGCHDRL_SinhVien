/**
 * Shared Hooks - Barrel Export
 * Tất cả hooks dùng chung giữa các features
 */

// Activities hooks
export { useActivities, useMyActivities } from './useActivities';

// Dashboard hooks
export {
  useUpcomingActivities,
  useMyActivities as useMyActivitiesDashboard,
  useStudentSummary,
  useClassStats,
  useDashboardData,
  useTeacherDashboard,
  useAdminDashboard
} from './useDashboardData';

// Utility hooks
export { useDebounce } from './useDebounce';
export { usePagination, usePaginatedTable } from './usePagination';
export { usePermissions } from './usePermissions';
export { default as useSafeNavigate } from './useSafeNavigate';

// Session hooks
export { useMultiSession } from './useMultiSession';
export { default as useSemesterData, invalidateSemesterDataCache } from './useSemesterData';
export { default as useSessionTracking } from './useSessionTracking';
