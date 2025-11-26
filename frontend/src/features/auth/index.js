/**
 * Auth Feature - Main Entry Point
 * 
 * 3-Tier Architecture:
 * - services/  : API layer (authApi)
 * - model/     : Business logic layer (hooks, mappers)
 * - ui/        : Presentation layer (components, pages)
 * - pages/     : Legacy pages (to be migrated)
 */

// Services Layer
export { authApi } from './services';

// Model Layer  
export * from './model';

// UI Layer
export * from './ui';
