import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

export default function AdminActivitiesEmpty({ scopeTab, onResetFilters }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-gray-200 p-12">
      <div className="absolute top-4 right-4 w-32 h-32 bg-indigo-200/30 rounded-full blur-2xl"></div>
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 border-2 border-gray-200">
          <Activity className="h-10 w-10 text-gray-400" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Không tìm thấy hoạt động nào
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {scopeTab === 'class'
            ? 'Lớp này chưa có hoạt động nào trong học kỳ được chọn. Hãy thử chọn lớp khác hoặc học kỳ khác.'
            : 'Không có hoạt động nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc hoặc tạo hoạt động mới.'}
        </p>

        <button
          onClick={onResetFilters}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          Xóa lọc
        </button>
      </div>
    </div>
  );
}
