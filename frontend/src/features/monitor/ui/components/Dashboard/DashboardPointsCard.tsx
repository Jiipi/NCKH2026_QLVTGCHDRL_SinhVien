import React from 'react';

/**
 * DashboardPointsCard Component - Card điểm cá nhân với progress bar
 */
export default function DashboardPointsCard({ monitorPoints, totalPointsProgress, formatNumber }) {
  return (
    <div className="col-span-2 group relative">
      <div className="absolute inset-0 bg-black/30 transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
      <div className="relative bg-gradient-to-br from-pink-400 via-purple-500 to-purple-600 border-4 border-black p-3 rounded-xl transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full">
        <p className="text-white/90 font-black text-[10px] uppercase tracking-wider mb-1">ĐIỂM CÁ NHÂN CỦA TÔI</p>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-black text-white">{formatNumber(monitorPoints)}</p>
          <p className="text-sm font-bold text-white/70">/100</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex-1">
            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(totalPointsProgress, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-white font-black text-lg ml-2">
            <span className="text-[10px] font-bold text-white/80">TIẾN ĐỘ </span>
            {formatNumber(totalPointsProgress)}%
          </p>
        </div>
      </div>
    </div>
  );
}

