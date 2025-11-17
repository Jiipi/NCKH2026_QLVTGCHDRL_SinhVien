export { default as LoadingSpinner } from './LoadingSpinner';
export { default as Pagination } from './Pagination';
export { EmptyState } from '../../../components/AdminComponents';

export const ErrorMessage = ({ message = 'Đã xảy ra lỗi', className = '' }) => (
  <div className={`p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 ${className}`}>
    {message}
  </div>
);
