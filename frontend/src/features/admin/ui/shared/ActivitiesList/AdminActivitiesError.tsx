import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AdminActivitiesErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function AdminActivitiesError({ message, onRetry }: AdminActivitiesErrorProps): React.ReactElement {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-rose-200/70 bg-rose-50/70 p-12 shadow-sm backdrop-blur-2xl dark:border-rose-400/20 dark:bg-rose-400/10">
      <div className="absolute right-4 top-4 h-32 w-32 rounded-full bg-rose-300/20 blur-2xl dark:bg-rose-400/10" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-rose-200/70 bg-white/65 shadow-sm backdrop-blur-xl dark:border-rose-400/20 dark:bg-white/5">
          <AlertTriangle className="h-10 w-10 text-rose-500 dark:text-rose-300" />
        </div>

        <h3 className="mb-2 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
          Đã xảy ra lỗi
        </h3>
        <p className="mb-6 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
          {message || 'Không thể tải danh sách hoạt động. Vui lòng thử lại sau.'}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 hover:shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
}
