import React from 'react';
import { BarChart3, TrendingUp, Eye } from 'lucide-react';

export default function TeacherChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Hoạt động theo tháng</h3>
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Eye className="w-5 h-5" />
          </button>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Biểu đồ sẽ được hiển thị ở đây</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Tỷ lệ tham gia</h3>
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Eye className="w-5 h-5" />
          </button>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Biểu đồ sẽ được hiển thị ở đây</p>
          </div>
        </div>
      </div>
    </div>
  );
}

