import React from 'react';
import { Users, BarChart3, Award, Sparkles } from 'lucide-react';

export default function ReportsChartSelector({ selectedChart, onChartChange }) {
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
          <ChartButton
            active={selectedChart === 'participation'}
            onClick={() => onChartChange('participation')}
            icon={Users}
            label="Tỷ Lệ Tham Gia"
          />
          <ChartButton
            active={selectedChart === 'activities'}
            onClick={() => onChartChange('activities')}
            icon={BarChart3}
            label="Loại Hoạt Động"
          />
          <ChartButton
            active={selectedChart === 'points'}
            onClick={() => onChartChange('points')}
            icon={Award}
            label="Điểm Rèn Luyện"
          />
        </div>
      </div>
    </div>
  );
}

function ChartButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
        active
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

