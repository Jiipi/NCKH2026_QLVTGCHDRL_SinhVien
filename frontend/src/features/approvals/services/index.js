/**
 * Approvals Services Layer - Barrel Export
 * 
 * API Structure (SOLID - Single Responsibility):
 * - approvalsApi       : Legacy unified API (backward compatible)
 * - approvalClassApi   : Class-level approvals (Monitor/Lớp trưởng)
 * - approvalAdminApi   : Admin-level approvals (toàn hệ thống)
 * - approvalTeacherApi : Teacher-level approvals (Giảng viên)
 */

// Legacy unified API (for backward compatibility)
export { default as approvalsApi } from './approvalsApi';

// Modular APIs
export { approvalClassApi } from './approvalClassApi';
export { approvalAdminApi } from './approvalAdminApi';
export { approvalTeacherApi } from './approvalTeacherApi';

// Error handling utilities
export * from './apiErrorHandler';
