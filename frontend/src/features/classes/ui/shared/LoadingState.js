import React from 'react';

/**
 * LoadingState - Reusable loading component
 */
export default function LoadingState({ 
  message = 'Đang tải...',
  size = 'lg'
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-center h-64">
        <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}></div>
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
}

