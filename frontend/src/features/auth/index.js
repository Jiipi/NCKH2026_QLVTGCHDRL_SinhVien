/**
 * Auth Feature - Main Entry Point
 * 
 * 3-Tier Architecture (SOLID):
 * - services/  : API layer (authApi) - Data Access
 * - model/     : Business logic layer (hooks, mappers) - Business Logic
 * - ui/        : Presentation layer (pages, shared components) - Presentation
 */

// Services Layer
export { authApi } from './services';

// Model Layer  
export * from './model';

// UI Layer
export * from './ui';
