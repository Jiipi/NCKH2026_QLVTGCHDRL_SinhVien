import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminActivitiesError({ message, onRetry }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl border-2 border-rose-200 p-12">
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 border-2 border-rose-200">
          <AlertTriangle className="h-10 w-10 text-rose-500" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Đã xảy ra lỗi
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {message || 'Không thể tải danh sách hoạt động. Vui lòng thử lại sau.'}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl hover:from-rose-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
}
