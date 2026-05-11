import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutDataItem {
  name: string;
  value: number;
  color?: string;
}

interface PointsDonutChartProps {
  data: DonutDataItem[];
  totalLabel?: string;
  totalValue?: number | string;
  size?: number;
}

const FALLBACK_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{name}</p>
      <p className="text-slate-500 dark:text-slate-400">{value} điểm</p>
    </div>
  );
};

export default function PointsDonutChart({
  data,
  totalLabel = 'Tổng',
  totalValue,
  size = 200
}: PointsDonutChartProps) {
  const total = totalValue ?? data.reduce((s, d) => s + d.value, 0);
  const filtered = data.filter(d => d.value > 0);

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: size }}>
        <p className="text-sm text-slate-400 dark:text-slate-500">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.3}
            outerRadius={size * 0.42}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
            animationBegin={0}
            animationDuration={800}
          >
            {filtered.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-black text-slate-800 dark:text-white">{total}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {totalLabel}
        </span>
      </div>
    </div>
  );
}
