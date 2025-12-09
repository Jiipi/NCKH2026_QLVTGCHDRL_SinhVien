/**
 * API Repositories Index
 * Export all API repositories for easy import
 * 
 * Usage:
 *   import { activityApi, userApi } from '@shared/api/repositories';
 */

// Core repositories
export { activityApi } from './activity.api';
export { registrationApi } from './registration.api';
export { userApi } from './user.api';
export { authApi } from './auth.api';

// Feature repositories
export { dashboardApi } from './dashboard.api';
export { notificationApi } from './notification.api';
export { semesterApi } from './semester.api';
export { classApi } from './class.api';
export { reportApi } from './report.api';
export { pointsApi } from './points.api';
export { activityTypeApi } from './activityType.api';
export { roleApi } from './role.api';
export { qrApi } from './qr.api';

// Re-export types
export type { GetRegistrationsParams } from './registration.api';
export type { GetUsersParams, CreateUserDto, UpdateUserDto } from './user.api';
export type { LoginDto, RegisterDto, LoginResponse } from './auth.api';
export type { StudentDashboard, TeacherDashboard, MonitorDashboard, AdminDashboard } from './dashboard.api';
export type { CreateNotificationDto } from './notification.api';
export type { ReportOverview, ClassReport } from './report.api';
export type { CreateActivityTypeDto, UpdateActivityTypeDto } from './activityType.api';
export type { Role, CreateRoleDto, UpdateRoleDto } from './role.api';
export type { QRCodeData, AttendanceRecord } from './qr.api';
