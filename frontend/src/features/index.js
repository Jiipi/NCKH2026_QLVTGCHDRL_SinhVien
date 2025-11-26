/**
 * Features - Main Barrel Export
 * 
 * Centralized exports for all features following 3-tier architecture
 * 
 * 3-Tier Architecture Pattern:
 * - services/  : API layer (API calls, error handling)
 * - model/     : Business logic layer (hooks, utils, mappers)
 * - ui/        : Presentation layer (components, pages)
 */

// Core Features (Full 3-tier)
export * from './activities';
export * from './admin';
export * from './approvals';
export * from './auth';
export * from './dashboard';
export * from './monitor';
export * from './notifications';
export * from './qr-attendance';
export * from './student';
export * from './teacher';
export * from './users';

// Partial 3-tier Features
export * from './activity-types';
export * from './header';
export * from './profile';

// Simple Features (Pages only)
export * from './classes';
export * from './reports';
export * from './semesters';
export * from './settings';
