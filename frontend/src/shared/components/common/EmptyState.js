import React from 'react';

export default function EmptyState({ title = 'Không có dữ liệu', message, onClearFilters, className = '' }) {
  return (
    <div className={`p-6 text-center rounded-lg border border-gray-200 bg-gray-50 ${className}`}>
      <div className="text-lg font-semibold text-gray-800">{title}</div>
      {message && <div className="text-sm text-gray-600 mt-1">{message}</div>}
      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 inline-flex items-center px-3 py-2 rounded-md bg-white border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
