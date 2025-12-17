/**
 * Shared Library Exports
 */

// Date utilities
export { formatDateVN, formatTimeVN, formatDateTimeVN } from './date';

// Avatar utilities  
export * from './avatar';

// Role utilities
export {
  normalizeRole,
  roleMatches,
  getRoleDisplayName,
  isAdmin,
  isTeacher,
  isMonitor,
  isStudent,
  ROLE_DISPLAY_NAMES
} from './role';
export type { NormalizedRole } from './role';

// Activity images
export * from './activityImages';

// API normalization
export * from './apiNormalization';

// Semester utilities
export {
  normalizeSemesterFormat,
  buildSemesterValue,
  parseSemesterString,
  getCurrentSemesterValue,
  getSemesterLabel,
  isSameSemester
} from './semester';
export type { SemesterNumber, HocKy, ParsedSemester } from './semester';

// Asset URL resolver
export { resolveAssetUrl } from './assetUrl';

// Mappers
export * from './mappers';

// Hooks utilities
export * from './hooks';
