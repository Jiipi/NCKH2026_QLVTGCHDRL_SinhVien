import React, { useMemo } from 'react';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { PointsDonutChart, ActivityBarChart } from '../../../../../shared/ui/charts';

const STATUS_CONFIG: Record<string, { name: string; color: string }> = {
  cho_duyet: { name: 'Chờ duyệt', color: '#F59E0B' },
  da_duyet: { name: 'Đã duyệt', color: '#10B981' },
  tu_choi: { name: 'Từ chối', color: '#EF4444' },
  da_tham_gia: { name: 'Đã tham gia', color: '#6366F1' },
  da_huy: { name: 'Đã hủy', color: '#94A3B8' }
};

interface MonitorChartsSectionProps {
  myActivities: {
    all?: any[];
    pending?: any[];
    approved?: any[];
    joined?: any[];
    rejected?: any[];
  };
  topStudents: any[];
  totalStudents: number;
}

export default function MonitorChartsSection({ myActivities, topStudents, totalStudents }: MonitorChartsSectionProps) {
  const allActivities = myActivities?.all || [];

  // Registration status distribution
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    allActivities.forEach((act: any) => {
      const status = act.trang_thai_dk || act.trang_thai || 'unknown';
      map[status] = (map[status] || 0) + 1;
    });
    return Object.entries(map).map(([key, count]) => {
      const cfg = STATUS_CONFIG[key] || { name: key, color: '#94A3B8' };
      return { name: cfg.name, value: count, color: cfg.color };
    });
  }, [allActivities]);

  // Top students bar chart
  const topStudentsBar = useMemo(() => {
    if (!topStudents?.length) return [];
    return topStudents.slice(0, 5).map((s: any) => ({
      name: (s.ho_ten || s.name || s.mssv || '').split(' ').pop() || '?',
      value: Number(s.tong_diem || s.points || 0)
    }));
  }, [topStudents]);

  if (allActivities.length === 0 && topStudentsBar.length === 0) return null;

  const totalRegs = statusData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Chart 1: Donut — Trạng thái đăng ký lớp */}
      {statusData.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-400/10">
              <PieIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tổng quan đăng ký</h3>
              <p className="text-[10px] text-slate-400">Hoạt động cá nhân theo trạng thái</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <PointsDonutChart data={statusData} totalLabel="Tổng" totalValue={totalRegs} size={170} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {statusData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-500 dark:text-slate-400">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart 2: Bar — Top sinh viên điểm cao */}
      {topStudentsBar.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-400/10">
              <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Top sinh viên</h3>
              <p className="text-[10px] text-slate-400">Điểm rèn luyện cao nhất lớp</p>
            </div>
          </div>
          <ActivityBarChart data={topStudentsBar} height={190} yAxisLabel="Điểm" />
          <div className="mt-2 text-center">
            <span className="text-[10px] font-medium text-slate-400">Tổng: {totalStudents} sinh viên</span>
          </div>
        </div>
      )}
    </div>
  );
}
