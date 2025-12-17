/**
 * Activities Feature - Main Entry Point
 * 
 * 3-Tier Architecture:
 * - shared/api/repositories : Centralized API layer
 * - model/     : Business logic layer (hooks, utils)
 * - ui/        : Presentation layer (components, pages)
 * 
 * NOTE: Services folder has been moved to shared/api/repositories
 * Use activityApi from '@shared/api/repositories' instead
 * 
 * NOTE: Both model and ui export 'ActivityFilters' - model exports a type,
 * ui exports a React component. We export the component from ui and
 * the type from model with an alias (ActivityFilterParams).
 */

// Model Layer - Business Logic (explicit exports to control ActivityFilters)
export {
  // Utils
  parseDateSafe,
  getDefaultSemester,
  getDefaultYearRange,
  computeSemesterValue,
  parseSemesterValue,
  getCurrentSemesterValue,
  formatToDatetimeLocal,
  isDatePast,
  isDeadlinePast,
  isAfterStart,
  filterBySearch,
  filterByType,
  filterByTypeId,
  filterByStatus,
  filterByDateRange,
  applyAllFilters,
  categorizeByRegistrationStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  ADMIN_STATUS_COLORS,
  REGISTRATION_STATUS_CONFIG,
  ACTIVITY_STATUS_CONFIG,
  ACTIVITY_STATUS_OPTIONS,
  ADMIN_STATUS_OPTIONS,
  getStatusColor,
  getStatusBadgeConfig,
  isOpenForRegistration,
  canRegisterForActivity,
  getStatusColorHelper,
  // Hooks
  useActivities,
  useActivitiesDefault,
  useActivityDetail,
  useActivityDetailDefault,
  useActivityRegistration,
  useActivityRegistrationDefault,
  useManageActivity,
  useManageActivityDefault
} from './model';

// Re-export types from model
export type {
  ParsedSemester,
  ActivityFilterParams,
  ActivityModel,
  CategorizedActivities,
  ActivityStatus,
  RegistrationStatus,
  StatusColorConfig,
  StatusConfig,
  StatusOption,
  StatusColorResult,
  UseActivitiesOptions,
  UseActivitiesReturn,
  ActivityFilters as ActivityFiltersType, // Type alias to avoid conflict with component
  ActivityMode,
  UseActivityDetailOptions,
  UseActivityDetailReturn,
  UseActivityRegistrationOptions,
  UseActivityRegistrationReturn,
  UseManageActivityReturn,
  ActivityFormData,
  FormStatus,
  FieldErrors
} from './model';

// UI Layer - Presentation (ActivityFilters here is the React component)
export * from './ui';

// Re-export from shared API for backwards compatibility
export { activityApi, activityTypeApi } from '../../shared/api/repositories';
