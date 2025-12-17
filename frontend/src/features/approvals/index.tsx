/**
 * Approvals Feature - Main Entry Point
 * 
 * 3-Tier Architecture (SOLID):
 * - services/  : API layer (Data Access)
 *   - approvalsApi       : Legacy unified API (backward compatible)
 *   - approvalClassApi   : Class-level approvals (Monitor/Lớp trưởng)
 *   - approvalAdminApi   : Admin-level approvals (toàn hệ thống)
 *   - approvalTeacherApi : Teacher-level approvals (Giảng viên)
 * 
 * - model/     : Business logic layer (hooks, utils)
 *   - useClassApprovals   : Class-level approval logic
 *   - useAdminApprovals   : Admin-level approval logic
 *   - useTeacherApprovals : Teacher-level approval logic
 * 
 * - ui/        : Presentation layer (components, pages)
 *   - components/  : Reusable UI components
 *   - pages/       : Page-level compositions
 */

// Services Layer
export { 
  approvalsApi,
  approvalClassApi,
  approvalAdminApi,
  approvalTeacherApi
} from './services';
export * from './services/apiErrorHandler';

// Model Layer
export * from './model';

// UI Layer
export * from './ui';
