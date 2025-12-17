/**
 * Activities Model Layer - Barrel Export
 * Combines utils and hooks for business logic layer
 * 
 * NOTE: Both hooks and utils export 'ActivityFilters' - we use explicit exports
 * to avoid TS2308 duplicate export errors. The hooks version is exported as
 * 'ActivityFilters' and the utils version is exported as 'ActivityFilterParams'.
 */

// Utils - explicit exports to avoid ActivityFilters conflict
export {
  parseDateSafe,
  getDefaultSemester,
  getDefaultYearRange,
  computeSemesterValue,
  parseSemesterValue,
  getCurrentSemesterValue,
  formatToDatetimeLocal,
  isDatePast,
  isDeadlinePast,
  isAfterStart
} from './utils';

export type { ParsedSemester } from './utils';

export {
  filterBySearch,
  filterByType,
  filterByTypeId,
  filterByStatus,
  filterByDateRange,
  applyAllFilters,
  categorizeByRegistrationStatus
} from './utils';

// Re-export ActivityFilters from utils with a different name to avoid conflict
export type { ActivityFilters as ActivityFilterParams, Activity as ActivityModel, CategorizedActivities } from './utils';

export {
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
  canRegisterForActivity
} from './utils';

export type {
  ActivityStatus,
  RegistrationStatus,
  StatusColorConfig,
  StatusConfig,
  StatusOption
} from './utils';

export { getStatusColor as getStatusColorHelper } from './utils';
export type { StatusColorResult } from './utils';

// Hooks - all exports including the canonical ActivityFilters type
export * from './hooks';
