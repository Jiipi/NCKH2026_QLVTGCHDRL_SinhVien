import React from 'react';
import { Calendar, Filter, Download } from 'lucide-react';

export default function TeacherReportsTable() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Báo cáo chi tiết</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Lọc
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>
      
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-500 mb-2">Chưa có dữ liệu báo cáo</h4>
        <p className="text-gray-400">Dữ liệu báo cáo sẽ được hiển thị khi có hoạt động</p>
      </div>
    </div>
  );
}

