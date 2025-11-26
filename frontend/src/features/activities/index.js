/**
 * Activities Feature - Main Entry Point
 * 
 * 3-Tier Architecture:
 * - services/  : API layer (activitiesApi, modular APIs)
 * - model/     : Business logic layer (hooks, utils)
 * - ui/        : Presentation layer (components, pages)
 */

// Services Layer
export { 
  activitiesApi,
  activityCrudApi,
  activityListApi,
  activityRegistrationApi,
  activityAdminApi,
  activityTeacherApi,
} from './services';
export * from './services/apiErrorHandler';

// Model Layer
export * from './model';

// UI Layer
export * from './ui';
