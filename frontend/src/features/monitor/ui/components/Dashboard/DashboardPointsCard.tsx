import React from 'react';

/**
 * DashboardPointsCard Component - Card điểm cá nhân với progress bar
 */
export default function DashboardPointsCard({ monitorPoints, totalPointsProgress, formatNumber }) {
  return (
    <div className="col-span-2 rounded-2xl border border-white/60 bg-white/60 p-3 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
      <div className="h-full">
        <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">ĐIỂM CÁ NHÂN CỦA TÔI</p>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-black text-indigo-600 dark:text-indigo-300">{formatNumber(monitorPoints)}</p>
          <p className="text-sm font-bold text-slate-400">/100</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex-1">
            <div className="relative h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
              <div 
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-1000" 
                style={{ width: `${Math.min(totalPointsProgress, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="ml-2 text-lg font-black text-indigo-600 dark:text-indigo-300">
            <span className="text-[10px] font-bold text-slate-400">TIẾN ĐỘ </span>
            {formatNumber(totalPointsProgress)}%
          </p>
        </div>
      </div>
    </div>
  );
}

