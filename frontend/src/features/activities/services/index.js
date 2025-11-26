/**
 * Activities Services Layer - Barrel Export
 * API services for activities feature
 */

/**
 * Activities Services - Barrel Export
 * 
 * API Structure:
 * - activitiesApi      : Legacy unified API (backward compatible)
 * - activityCrudApi    : CRUD operations
 * - activityListApi    : List/filter operations
 * - activityRegistrationApi : Registration operations
 * - activityAdminApi   : Admin operations
 * - activityTeacherApi : Teacher operations
 */

// Legacy unified API (for backward compatibility)
export { default as activitiesApi } from './activitiesApi';

// Modular APIs
export { activityCrudApi } from './activityCrudApi';
export { activityListApi } from './activityListApi';
export { activityRegistrationApi } from './activityRegistrationApi';
export { activityAdminApi } from './activityAdminApi';
export { activityTeacherApi } from './activityTeacherApi';

// Error handling utilities
export * from './apiErrorHandler';
export * from './apiErrorHandler';
