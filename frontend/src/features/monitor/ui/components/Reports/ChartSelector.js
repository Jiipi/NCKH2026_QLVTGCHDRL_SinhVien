import React from 'react';
import { Sparkles, Users, BarChart3, Award } from 'lucide-react';

/**
 * ChartSelector Component - Chọn loại biểu đồ
 */
export default function ChartSelector({ selectedChart, onChartChange }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
      
      <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <h3 className="text-base font-bold text-gray-900">Chọn biểu đồ</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChartChange('participation')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              selectedChart === 'participation'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Tỷ Lệ Tham Gia
          </button>
          <button
            onClick={() => onChartChange('activities')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              selectedChart === 'activities'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            Loại Hoạt Động
          </button>
          <button
            onClick={() => onChartChange('points')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              selectedChart === 'points'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Award className="h-4 w-4" />
            Điểm Rèn Luyện
          </button>
        </div>
      </div>
    </div>
  );
}

