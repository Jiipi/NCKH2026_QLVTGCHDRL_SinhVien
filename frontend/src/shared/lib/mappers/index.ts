/**
 * Shared Mappers - Central Export
 * Re-exports all mapper functions from shared/lib/mappers
 */

// Activity mappers
export {
  extractApproverRole,
  normalizeArrayField,
  mapRegistrationStatusStudent,
  mapActivityStatus,
  mapRegistrationStatusMonitor,
  mapAttendanceStatus,
  mapActivityToUI,
  groupActivitiesByStatusStudent,
  groupActivitiesByStatusTeacher,
  type MappedActivity,
  type GroupedActivities,
} from './activity.mapper';

// Registration mappers
export {
  mapRegistrationToUITeacher,
  mapRegistrationToUIMonitor,
  groupRegistrationsByStatusTeacher,
  groupRegistrationsByStatusMonitor,
  type MappedStudent,
  type MappedRegistration,
  type GroupedRegistrations,
} from './registration.mapper';
