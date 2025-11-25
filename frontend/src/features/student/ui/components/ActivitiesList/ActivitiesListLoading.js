import React from 'react';
import { Zap } from 'lucide-react';

export default function ActivitiesListLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative inline-block mb-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-indigo-600 absolute inset-0"></div>
        <Zap className="absolute inset-0 m-auto h-6 w-6 text-blue-600 animate-pulse" />
      </div>
      <p className="text-gray-700 font-semibold text-lg">Đang tải danh sách...</p>
    </div>
  );
}

