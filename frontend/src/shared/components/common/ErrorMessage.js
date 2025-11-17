import React from 'react';

export default function ErrorMessage({ message = 'Đã xảy ra lỗi', className = '' }) {
  return (
    <div className={`p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 ${className}`}>
      {message}
    </div>
  );
}
