/**
 * Shared Module - Main Barrel Export
 * Centralized exports cho tất cả shared resources
 * 
 * Usage:
 *   import { useDebounce, LoadingSpinner } from '@/shared';
 *   import { useAppStore } from '@/shared/store';
 */

// API
export * from './api';

// Contexts
export * from './contexts/NotificationContext';
export * from './contexts/TabSessionContext';

// Hooks
export * from './hooks';

// Store
export { useAppStore } from './store';

// Services
export { default as sessionManager } from './services/sessionManager';
export type {
  SessionUser,
  SessionData,
  SessionInfo,
  ActiveSession,
  SessionEvent,
  SessionEventType,
  DetailedSessionsInfo,
  SessionEventCallback
} from './services';

// Lib / Utils
export { formatDateVN, formatTimeVN, formatDateTimeVN } from './lib/date';
export { normalizeRole, roleMatches, getRoleDisplayName, isAdmin, isTeacher, isMonitor, isStudent } from './lib/role';
export type { NormalizedRole } from './lib/role';
export { normalizeSemesterFormat, buildSemesterValue, parseSemesterString, getCurrentSemesterValue, getSemesterLabel, isSameSemester } from './lib/semester';
export type { SemesterNumber, HocKy, ParsedSemester } from './lib/semester';
export { resolveAssetUrl } from './lib/assetUrl';

// Shared Types (excluding PaginationParams which is already in hooks)
export type {
  PaginatedResponse,
  ApiResponse,
  ActivityStatus,
  RegistrationStatus,
  Activity,
  ActivityType,
  GetActivitiesParams,
  CreateActivityDto,
  UpdateActivityDto,
  UserRole,
  User,
  AuthUser,
  Registration,
  ApproveRegistrationDto,
  RejectRegistrationDto,
  DashboardStats,
  Notification,
  Semester,
  Class,
  StudentPoints,
  PointDetail
} from './types';

// Shared Mappers
export * from './lib/mappers';

// Components - Common
export {
  LoadingSpinner,
  Pagination,
  EmptyState,
  SearchBar,
  StatusFilter,
  ViewModeToggle,
  AdvancedFilters,
  LoadingState,
  ConfirmModal,
  Toast,
  AvatarUpload,
  UserSearchSelect,
  ProfileTabs,
  SemesterFilter,
  ErrorMessage
} from './components/common';

// Components - Layout
export {
  Header,
  StudentSidebar,
  TeacherSidebar,
  MonitorSidebar,
  AdminStudentSidebar,
  AdminStudentLayout,
  ClassManagementLayout,
  MobileSidebarWrapper,
  MobileMenuButton,
  ResponsiveUtils
} from './components/layout';

// Components - Session
export {
  MultiSessionIndicator,
  SessionMonitor,
  PermissionGuard,
  TabManager
} from './components/session';

// Components - Semester
export {
  SemesterClosureBanner,
  SemesterClosureWidget
} from './components/semester';
