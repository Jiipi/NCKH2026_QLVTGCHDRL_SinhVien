// Core components
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as Pagination } from './Pagination';
export { EmptyState } from '../../../components/AdminComponents';

// New shared components for 3-tier refactoring
export { default as SearchBar } from './SearchBar';
export { default as StatusFilter } from './StatusFilter';
export { default as ViewModeToggle } from './ViewModeToggle';
export { default as AdvancedFilters, FilterField, FilterInput, FilterSelect } from './AdvancedFilters';
export { default as LoadingState, LoadingOverlay, LoadingInline } from './LoadingState';

export const ErrorMessage = ({ message = 'Đã xảy ra lỗi', className = '' }) => (
  <div className={`p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 ${className}`}>
    {message}
  </div>
);
