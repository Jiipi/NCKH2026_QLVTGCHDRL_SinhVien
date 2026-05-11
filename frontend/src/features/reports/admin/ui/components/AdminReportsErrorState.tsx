import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function AdminReportsErrorState({ error }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-[2rem] border border-rose-200/70 bg-rose-50/70 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-rose-400/20 dark:bg-rose-400/10">
      <div className="max-w-lg text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200/70 bg-white/65 shadow-sm backdrop-blur-xl dark:border-rose-400/20 dark:bg-white/5">
          <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-300" />
        </div>
        <h3 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">Có lỗi xảy ra</h3>
        <p className="mt-3 text-sm font-bold leading-6 text-rose-700 dark:text-rose-200">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md"
        >
          <RefreshCcw className="h-5 w-5" />
          Tải lại trang
        </button>
      </div>
    </div>
  );
}

