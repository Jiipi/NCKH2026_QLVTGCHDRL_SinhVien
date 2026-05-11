import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendDataItem {
  label: string;
  value: number;
  secondary?: number;
}

interface ParticipationTrendChartProps {
  data: TrendDataItem[];
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  showSecondary?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.stroke }} className="text-slate-500 dark:text-slate-400">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function ParticipationTrendChart({
  data,
  height = 240,
  primaryColor = '#6366F1',
  secondaryColor = '#10B981',
  primaryLabel = 'Hoạt động',
  secondaryLabel = 'Đăng ký',
  showSecondary = false
}: ParticipationTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-slate-400 dark:text-slate-500">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}>
        <defs>
          <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradientSecondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          name={primaryLabel}
          stroke={primaryColor}
          strokeWidth={2.5}
          fill="url(#gradientPrimary)"
          animationDuration={800}
        />
        {showSecondary && (
          <Area
            type="monotone"
            dataKey="secondary"
            name={secondaryLabel}
            stroke={secondaryColor}
            strokeWidth={2}
            fill="url(#gradientSecondary)"
            animationDuration={1000}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
