/**
 * Admin Feature - Main Entry Point
 *
 * 3-Tier Architecture:
 * - services/  : API & data access layer
 * - model/     : Business logic layer (hooks, mappers, utils)
 * - ui/        : Presentation layer (pages, components)
 */

// UI Layer (presentation)
export * from './ui';

// Model Layer (business logic)
export * from './model';

// Services Layer (data access)
export * from './services';


