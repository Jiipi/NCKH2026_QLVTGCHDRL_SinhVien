import React from 'react';
import { Users, Calendar, AlertCircle, Activity, Clock, Trophy, Star, Target } from 'lucide-react';

/**
 * DashboardStatsCard Component - Card thống kê với neo-brutalism design
 */
export default function DashboardStatsCard({ 
  icon: Icon, 
  label, 
  value, 
  subLabel, 
  bgColor, 
  textColor = 'text-black',
  badge,
  badgeText,
  badgeColor = 'bg-black/20',
  goalPoints,
  goalText
}) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-black/30 transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
      <div className={`relative ${bgColor} border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col`}>
        <div className="flex items-center justify-between mb-2">
          {Icon && <Icon className={`w-5 h-5 ${textColor}`} />}
          {badge && typeof badge !== 'string' && (
            <div className={`${badgeColor} px-2 py-0.5 rounded-md`}>
              {badge}
            </div>
          )}
          {badgeText && !badge && (
            <div className={`${badgeColor} text-white px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider`}>
              {badgeText}
            </div>
          )}
        </div>
        {goalPoints !== undefined ? (
          goalPoints > 0 ? (
            <>
              <p className={`text-2xl font-black ${textColor} mb-0.5`}>{goalPoints}</p>
              <p className={`text-[9px] font-black ${textColor}/80 uppercase tracking-wide leading-tight line-clamp-2`}>{goalText}</p>
            </>
          ) : (
            <>
              <p className={`text-2xl font-black ${textColor} mb-0.5`}>🎉</p>
              <p className={`text-[9px] font-black ${textColor}/70 uppercase tracking-wider`}>ĐÃ ĐẠT XUẤT SẮC</p>
            </>
          )
        ) : (
          <>
            <p className={`text-3xl font-black ${textColor} mb-0.5`}>{value}</p>
            <p className={`text-[10px] font-black ${textColor}/80 uppercase tracking-wider`}>{subLabel}</p>
          </>
        )}
      </div>
    </div>
  );
}

