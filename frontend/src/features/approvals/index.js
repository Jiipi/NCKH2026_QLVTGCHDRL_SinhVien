/**
 * Approvals Feature - Main Entry Point
 * 
 * 3-Tier Architecture:
 * - services/  : API layer
 * - model/     : Business logic layer (hooks, utils)
 * - ui/        : Presentation layer (components, pages)
 */

// Services Layer
export { approvalsApi } from './services';
export * from './services/apiErrorHandler';

// Model Layer
export * from './model';

// UI Layer
export * from './ui';
