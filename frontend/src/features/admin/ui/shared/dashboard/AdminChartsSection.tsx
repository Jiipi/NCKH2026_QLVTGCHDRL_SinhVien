import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import http from '../../../../../shared/api/http';
import { PointsDonutChart, ActivityBarChart, ParticipationTrendChart, StatsProgressBar } from '../../../../../shared/ui/charts';

interface AdminChartStats {
  activitiesByType: { name: string; count: number }[];
  registrationsByStatus: { name: string; count: number; color: string }[];
  participationRate: number;
  monthlyTrend: { label: string; activities: number; registrations: number }[];
}

export default function AdminChartsSection() {
  const [chartData, setChartData] = useState<AdminChartStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await http.get('/core/dashboard/admin/chart-stats');
        const data = res?.data?.data;
        if (!cancelled && data) setChartData(data);
      } catch (err) {
        console.error('[AdminChartsSection] Error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-72 animate-pulse rounded-2xl border border-white/60 bg-white/40 dark:border-white/10 dark:bg-slate-950/40" />
        ))}
      </div>
    );
  }

  if (!chartData) return null;

  const donutData = chartData.registrationsByStatus.map(r => ({
    name: r.name,
    value: r.count,
    color: r.color
  }));

  const barData = chartData.activitiesByType.slice(0, 6).map(a => ({
    name: a.name.length > 12 ? a.name.substring(0, 12) + '…' : a.name,
    value: a.count
  }));

  const trendData = chartData.monthlyTrend.map(m => ({
    label: m.label,
    value: m.activities,
    secondary: m.registrations
  }));

  const totalRegs = chartData.registrationsByStatus.reduce((s, r) => s + r.count, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Chart 1: Donut — Đăng ký theo trạng thái */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-400/10">
            <PieIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Trạng thái đăng ký</h3>
            <p className="text-[10px] text-slate-400">Phân bổ theo trạng thái</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <PointsDonutChart data={donutData} totalLabel="Tổng ĐK" totalValue={totalRegs} size={180} />
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {chartData.registrationsByStatus.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px]">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-slate-500 dark:text-slate-400">{r.name} ({r.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Bar — Hoạt động theo loại */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-400/10">
            <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Hoạt động theo loại</h3>
            <p className="text-[10px] text-slate-400">Top loại hoạt động</p>
          </div>
        </div>
        <ActivityBarChart data={barData} height={180} />
        {/* Participation rate */}
        <div className="mt-3">
          <StatsProgressBar
            label="Tỷ lệ tham gia thực tế"
            value={chartData.participationRate}
            max={100}
            color="#10B981"
            suffix="%"
            showPercentage={false}
          />
        </div>
      </div>

      {/* Chart 3: Trend — Xu hướng theo tháng */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 md:col-span-2 xl:col-span-1">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-400/10">
            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Xu hướng 6 tháng</h3>
            <p className="text-[10px] text-slate-400">Hoạt động & Đăng ký</p>
          </div>
        </div>
        <ParticipationTrendChart
          data={trendData}
          height={200}
          showSecondary
          primaryLabel="Hoạt động"
          secondaryLabel="Đăng ký"
        />
      </div>
    </div>
  );
}
