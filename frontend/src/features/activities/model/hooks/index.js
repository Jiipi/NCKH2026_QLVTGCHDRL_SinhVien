/**
 * Activities Model Hooks - Barrel Export
 * 
 * Note: Role-specific hooks have been moved to their respective modules:
 * - admin/model/useAdminActivitiesList.js
 * - student/model/hooks/useMyActivities.js
 * - teacher/model/hooks/useTeacherActivities.js
 * - monitor uses student/model/hooks/useMyActivities.js
 */

/**
 * Activities Hooks - Barrel Export
 * Centralized exports for all activity-related hooks
 */

// Activity management (create/edit)
export { useManageActivity } from './useManageActivity';

// Activity list with filters and pagination
export { useActivities } from './useActivities';

// Activity detail
export { useActivityDetail } from './useActivityDetail';

// Registration actions
export { useActivityRegistration } from './useActivityRegistration';

