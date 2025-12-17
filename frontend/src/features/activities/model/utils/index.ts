/**
 * Activities Model Utils - Barrel Export
 * Centralized exports for all utility functions
 */

// Activity utilities
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
} from './activityUtils';

export type { ParsedSemester } from './activityUtils';

// Filter utilities
export {
  filterBySearch,
  filterByType,
  filterByTypeId,
  filterByStatus,
  filterByDateRange,
  applyAllFilters,
  categorizeByRegistrationStatus
} from './activityFilters';

export type { Activity, ActivityFilters, CategorizedActivities } from './activityFilters';

// Status utilities
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
} from './activityStatus';

export type {
  ActivityStatus,
  RegistrationStatus,
  StatusColorConfig,
  StatusConfig,
  StatusOption
} from './activityStatus';

// UI Helpers
export { getStatusColor as getStatusColorHelper } from './activityUiHelpers';
export type { StatusColorResult } from './activityUiHelpers';
