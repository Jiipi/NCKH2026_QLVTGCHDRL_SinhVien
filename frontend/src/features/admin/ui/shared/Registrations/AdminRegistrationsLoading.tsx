import React from 'react';

export default function AdminRegistrationsLoading() {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-[2rem] border border-white/60 bg-white/60 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
      <div className="text-center">
        <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-r-amber-500 border-t-indigo-600 dark:border-white/10 dark:border-r-amber-300 dark:border-t-indigo-300" />
        <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">Đang tải danh sách đăng ký...</p>
      </div>
    </div>
  );
}

