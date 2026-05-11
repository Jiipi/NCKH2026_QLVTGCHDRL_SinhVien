import React from 'react';

interface StatsProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  showPercentage?: boolean;
  suffix?: string;
}

export default function StatsProgressBar({
  label,
  value,
  max,
  color = '#6366F1',
  showPercentage = true,
  suffix
}: StatsProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const displayValue = suffix ? `${value}${suffix}` : value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {displayValue}{showPercentage ? ` (${percentage}%)` : ''}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`
          }}
        />
      </div>
    </div>
  );
}
