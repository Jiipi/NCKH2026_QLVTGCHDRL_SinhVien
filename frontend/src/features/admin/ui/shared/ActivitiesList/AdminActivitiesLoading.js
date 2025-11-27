import React from 'react';

export default function AdminActivitiesLoading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="text-gray-600 font-medium">Đang tải danh sách hoạt động...</p>
      </div>
    </div>
  );
}
