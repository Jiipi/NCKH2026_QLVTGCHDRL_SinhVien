/**
 * API Layer Index
 * Export all API-related modules
 */

// Core exports
export { default as http } from './http';
export { default as API_ENDPOINTS, API_ENDPOINTS as endpoints } from './endpoints';
export { default as sessionStorageManager, SessionStorageManager } from './sessionStorageManager';
export { computeBaseURL } from './baseUrl';

// Repository exports
export * from './repositories';

// Type exports from repositories
export type {
    GetRegistrationsParams,
    GetUsersParams,
    CreateUserDto,
    UpdateUserDto,
    LoginDto,
    RegisterDto,
    LoginResponse,
    StudentDashboard,
    TeacherDashboard,
    MonitorDashboard,
    AdminDashboard,
    CreateNotificationDto,
    ReportOverview,
    ClassReport,
    CreateActivityTypeDto,
    UpdateActivityTypeDto,
    Role,
    CreateRoleDto,
    UpdateRoleDto,
    QRCodeData,
    AttendanceRecord,
} from './repositories';

// Session types
export type {
    SessionData,
    UserData,
    TabInfo,
    TabRegistry,
    ActiveTab,
    CurrentTabInfo,
} from './sessionStorageManager';
