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
 */

// Model Layer - Business Logic
export * from './model';

// UI Layer - Presentation
export * from './ui';

// Re-export from shared API for backwards compatibility
export { activityApi, activityTypeApi } from '../../shared/api/repositories';
