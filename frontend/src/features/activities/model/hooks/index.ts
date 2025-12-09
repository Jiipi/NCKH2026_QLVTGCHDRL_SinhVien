/**
 * Activity Hooks Index - TypeScript Version
 * Export all activity-related hooks
 */

export { useActivities, default as useActivitiesDefault } from './useActivities';
export { useActivityDetail, default as useActivityDetailDefault } from './useActivityDetail';
export { useActivityRegistration, default as useActivityRegistrationDefault } from './useActivityRegistration';
export { useManageActivity, default as useManageActivityDefault } from './useManageActivity';

// Re-export types
export type { UseActivitiesOptions, UseActivitiesReturn, ActivityFilters, ActivityMode } from './useActivities';
export type { UseActivityDetailOptions, UseActivityDetailReturn } from './useActivityDetail';
export type { UseActivityRegistrationOptions, UseActivityRegistrationReturn } from './useActivityRegistration';
export type { UseManageActivityReturn, ActivityFormData, FormStatus, FieldErrors } from './useManageActivity';
