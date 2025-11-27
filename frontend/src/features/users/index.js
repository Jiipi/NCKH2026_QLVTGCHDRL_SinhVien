/**
 * Users Feature - Main Entry Point
 * 
 * 3-Tier Architecture:
 * - services/  : API layer
 * - model/     : Business logic layer (hooks)
 * - ui/        : Presentation layer (components, pages)
 */

// Services Layer
export * from './services/apiErrorHandler';

// Model Layer
export * from './model';

// UI Layer
export * from './ui';
