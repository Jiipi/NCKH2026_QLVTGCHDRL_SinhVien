import React from 'react';
import { Shield } from 'lucide-react';

export default function AdminRegistrationsEmpty() {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/60 bg-white/60 p-12 text-center shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 bg-white/55 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <Shield className="h-8 w-8 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-lg font-bold text-slate-500 dark:text-slate-400">Không tìm thấy đăng ký nào</p>
    </div>
  );
}

