import React from 'react';
import { Calendar } from 'lucide-react';
import ScoreCard from './ScoreCard';

export default function ScoresActivities({ activities = [] }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <details className="group" open>
        <summary className="flex items-center justify-between p-6 cursor-pointer select-none hover:bg-gray-50 transition-colors rounded-t-xl">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            Lịch sử hoạt động đã tham gia
          </h3>
          <div className="flex items-center gap-3">
            {activities.length > 0 && (
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {activities.length} hoạt động
              </span>
            )}
            <svg className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="px-6 pb-6">
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {activities.length > 0 ? (
              activities.map((activity, index) => <ScoreCard key={activity.id || index} activity={activity} />)
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">Chưa có hoạt động nào trong kỳ này</p>
                <p className="text-sm text-gray-400 mt-2">Các hoạt động bạn đã tham gia sẽ hiển thị ở đây</p>
              </div>
            )}
          </div>
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          `}</style>
        </div>
      </details>
    </section>
  );
}

