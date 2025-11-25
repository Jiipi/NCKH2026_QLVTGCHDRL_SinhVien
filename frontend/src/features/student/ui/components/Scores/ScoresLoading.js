import React from 'react';
import SemesterFilter from '../../../../../widgets/semester/ui/SemesterSwitcher';
import { RefreshCw } from 'lucide-react';

export default function ScoresLoading({ semester, onSemesterChange }) {
  return (
    <div className="space-y-6" data-ref="student-scores-refactored">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Điểm rèn luyện</h1>
            <p className="text-orange-100">Theo dõi và phân tích kết quả rèn luyện của bạn</p>
          </div>
          <div className="min-w-[240px]">
            <SemesterFilter value={semester} onChange={onSemesterChange} label="" />
          </div>
        </div>
      </div>
      <div className="flex justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    </div>
  );
}

