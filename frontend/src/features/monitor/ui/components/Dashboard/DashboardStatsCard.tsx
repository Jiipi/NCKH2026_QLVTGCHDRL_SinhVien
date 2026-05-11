import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardStatsCardProps {
  icon?: LucideIcon;
  label?: string;
  value?: React.ReactNode;
  subLabel?: string;
  bgColor?: string;
  textColor?: string;
  badge?: React.ReactNode;
  badgeText?: string;
  badgeColor?: string;
  goalPoints?: number;
  goalText?: string;
}

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
}: DashboardStatsCardProps) {
  return (
    <div className="h-full rounded-2xl border border-white/60 bg-white/60 p-3 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
      <div className="flex h-full flex-col">
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

