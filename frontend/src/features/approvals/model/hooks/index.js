/**
 * Approvals Model Hooks - Barrel Export
 * 
 * Hook Structure (SOLID - Single Responsibility):
 * - useClassApprovals   : Class-level approval logic (Monitor/Lớp trưởng)
 * - useAdminApprovals   : Admin-level approval logic (toàn hệ thống)
 * - useTeacherApprovals : Teacher-level approval logic (Giảng viên)
 */

export { useClassApprovals } from './useClassApprovals';
export { useAdminApprovals } from './useAdminApprovals';
export { useTeacherApprovals } from './useTeacherApprovals';
