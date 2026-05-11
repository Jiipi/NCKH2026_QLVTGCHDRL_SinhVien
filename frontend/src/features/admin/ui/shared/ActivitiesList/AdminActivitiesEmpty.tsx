import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

interface AdminActivitiesEmptyProps {
  scopeTab: 'class' | 'all' | string;
  onResetFilters: () => void;
}

export default function AdminActivitiesEmpty({ scopeTab, onResetFilters }: AdminActivitiesEmptyProps): React.ReactElement {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-white/60 bg-white/60 p-12 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="absolute right-4 top-4 h-32 w-32 rounded-full bg-indigo-300/20 blur-2xl dark:bg-indigo-400/10" />
      <div className="absolute bottom-4 left-4 h-24 w-24 rounded-full bg-teal-300/20 blur-2xl dark:bg-teal-400/10" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/70 bg-white/55 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <Activity className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        </div>

        <h3 className="mb-2 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
          Không tìm thấy hoạt động nào
        </h3>
        <p className="mb-6 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
          {scopeTab === 'class'
            ? 'Lớp này chưa có hoạt động nào trong học kỳ được chọn. Hãy thử chọn lớp khác hoặc học kỳ khác.'
            : 'Không có hoạt động nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc hoặc tạo hoạt động mới.'}
        </p>

        <button
          onClick={onResetFilters}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
        >
          <RefreshCw className="h-4 w-4" />
          Xóa lọc
        </button>
      </div>
    </div>
  );
}
