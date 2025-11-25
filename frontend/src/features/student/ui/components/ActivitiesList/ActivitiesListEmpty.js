import React from 'react';
import { Users, Sparkles } from 'lucide-react';

export default function ActivitiesListEmpty({ scopeTab, onResetFilters }) {
  return (
    <div className="text-center py-16">
      <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-6">
        <Users className="h-16 w-16 text-green-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có hoạt động nào</h3>
      <p className="text-gray-600 mb-6">
        Giảng viên chủ nhiệm hoặc lớp trưởng chưa tạo hoạt động nào
      </p>
      {scopeTab === 'in-class' && (
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Sparkles className="h-5 w-5" />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}

