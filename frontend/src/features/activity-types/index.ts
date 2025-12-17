/**
 * Activity Types Feature - Main Entry Point
 * 
 * 3-Tier Architecture:
 * - services/  : API layer
 * - model/     : Business logic layer (hooks)
 * - ui/        : Presentation layer (pages)
 */

// Services Layer
export { activityTypesApi } from './services';

// Model Layer  
export * from './model';

// UI Layer
export * from './ui';
