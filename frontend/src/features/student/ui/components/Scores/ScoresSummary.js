import React from 'react';
import { Target, BarChart3 } from 'lucide-react';

function ProgressCircle({ percentage, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (percentage * circumference) / 100;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke="#e5e7eb" fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#3b82f6"
          fill="transparent"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        <span className="text-xs text-gray-500">mục tiêu</span>
      </div>
    </div>
  );
}

export default function ScoresSummary({ currentScore, targetScore, progressPercentage, stats, data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tổng điểm học kỳ</h3>
          <Target className="h-6 w-6 text-orange-600" />
        </div>
        <div className="flex items-center justify-center mb-4">
          <ProgressCircle percentage={Math.round(progressPercentage)} />
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {currentScore}/{targetScore}
          </div>
          <p className="text-gray-600 mb-2">điểm rèn luyện</p>
          {data?.summary?.xep_loai && (
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getClassificationBadge(data.summary.xep_loai)}`}>
              {data.summary.xep_loai}
            </span>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Thống kê nhanh</h3>
          <BarChart3 className="h-6 w-6 text-blue-600" />
        </div>
        <StatRow label="Hoạt động tham gia" value={stats.totalActivities} />
        <StatRow label="Điểm trung bình" value={stats.averagePoints?.toFixed(1)} />
        {data?.class_rankings?.my_rank_in_class && (
          <StatRow
            label="Xếp hạng lớp"
            value={`${data.class_rankings.my_rank_in_class}/${data.class_rankings.total_students_in_class || 1}`}
          />
        )}
      </section>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value ?? '-'}</span>
    </div>
  );
}

function getClassificationBadge(rank) {
  switch (rank) {
    case 'Xuất sắc':
      return 'bg-yellow-100 text-yellow-800';
    case 'Tốt':
      return 'bg-blue-100 text-blue-800';
    case 'Khá':
      return 'bg-green-100 text-green-800';
    case 'Trung bình':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-red-100 text-red-800';
  }
}

