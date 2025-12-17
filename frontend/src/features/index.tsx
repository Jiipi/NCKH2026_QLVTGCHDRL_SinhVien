/**
 * Features - Main Barrel Export
 * 
 * Centralized exports for all features following 3-tier architecture
 * 
 * 3-Tier Architecture Pattern:
 * - services/  : API layer (API calls, error handling)
 * - model/     : Business logic layer (hooks, utils, mappers)
 * - ui/        : Presentation layer (components, pages)
 * 
 * NOTE: Using namespaced exports to avoid TS2308 duplicate export errors
 * across features that share common symbol names.
 */

// Namespaced exports - each feature available as its own namespace
export * as Activities from './activities';
export * as Admin from './admin';
export * as Approvals from './approvals';
export * as Auth from './auth';
export * as Dashboard from './dashboard';
export * as Monitor from './monitor';
export * as Notifications from './notifications';
export * as QRAttendance from './qr-attendance';
export * as Student from './student';
export * as Teacher from './teacher';
export * as Users from './users';
export * as ActivityTypes from './activity-types';
export * as Profile from './profile';
export * as Classes from './classes';
export * as Reports from './reports';
export * as Semesters from './semesters';
export * as Settings from './settings';
