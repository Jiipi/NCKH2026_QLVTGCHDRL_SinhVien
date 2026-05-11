import React from 'react';
import { Shield, Download, Sparkles } from 'lucide-react';

export default function AdminRegistrationsHero({ onExport, exporting, canExport }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(245,158,11,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(129,140,248,0.12),transparent_28%)]" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-amber-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-amber-300">
            <Sparkles className="h-4 w-4" />
            Điều phối đăng ký
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/55 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <Shield className="h-6 w-6 text-amber-600 dark:text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Quản lý đăng ký</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">Phê duyệt, từ chối và theo dõi đăng ký hoạt động trong không gian quản trị tập trung.</p>
            </div>
          </div>
        </div>
        <button
          onClick={onExport}
          disabled={exporting || !canExport}
          className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-4 py-2 text-sm font-bold text-amber-700 shadow-sm backdrop-blur-xl transition-all duration-200 hover:bg-white/75 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-amber-300 dark:hover:bg-white/10"
        >
          <Download className={`h-4 w-4 ${exporting ? 'animate-bounce' : ''}`} />
          {exporting ? 'Đang xuất...' : 'Xuất Excel'}
        </button>
      </div>
    </section>
  );
}

