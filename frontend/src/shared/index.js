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

// Lib / Utils
export { formatDateVN, formatTimeVN, formatDateTimeVN } from './lib/date';
export { normalizeRole, roleMatches, getRoleDisplayName } from './lib/role';
export { sanitizeInput } from './lib/validation';

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
