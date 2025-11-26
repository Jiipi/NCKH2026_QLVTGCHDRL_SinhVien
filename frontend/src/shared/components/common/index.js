// Core components
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as Pagination } from './Pagination';
export { default as EmptyState } from './EmptyState';

// New shared components for 3-tier refactoring
export { default as SearchBar } from './SearchBar';
export { default as StatusFilter } from './StatusFilter';
export { default as ViewModeToggle } from './ViewModeToggle';
export { default as AdvancedFilters, FilterField, FilterInput, FilterSelect } from './AdvancedFilters';
export { default as LoadingState, LoadingOverlay, LoadingInline } from './LoadingState';

// UI Components
export { default as ConfirmModal } from './ConfirmModal';
export { default as Toast } from './Toast';
export { default as AvatarUpload } from './AvatarUpload';
export { default as UserSearchSelect } from './UserSearchSelect';
export { default as ProfileTabs } from './ProfileTabs';
export { default as SemesterFilter } from './SemesterFilter';

export const ErrorMessage = ({ message = 'Đã xảy ra lỗi', className = '' }) => (
  <div className={`p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 ${className}`}>
    {message}
  </div>
);
