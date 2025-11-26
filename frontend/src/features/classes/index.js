/**
 * Classes Feature - Main Entry Point
 * 
 * 3-Tier Architecture: model/ + services/ + ui/
 */

// Model Layer
export * from './model';

// Services Layer
export * from './services';

// UI Layer - Pages
export { default as ClassManagementPage } from './ui/ClassManagementPage';
export { default as ClassStudentsPage } from './ui/ClassStudentsPage';
export { default as ImportStudentsPage } from './ui/ImportStudentsPage';
export { default as StudentManagementPage } from './ui/StudentManagementPage';
