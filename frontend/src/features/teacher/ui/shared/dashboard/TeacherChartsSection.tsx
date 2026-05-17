import React, { useMemo } from 'react';
import { BarChart3, PieChart as PieIcon, Target } from 'lucide-react';
import { ActivityBarChart, PointsDonutChart, StatsProgressBar } from '../../../../../shared/ui/charts';

const WORKLOAD_COLORS = {
  pendingActivities: '#F59E0B',
  pendingRegistrations: '#8B5CF6',
  approvedThisWeek: '#10B981'
};

interface TeacherChartsSectionProps {
  stats: {
    pendingApprovals?: number;
    avgClassScore?: number;
    participationRate?: number;
    approvedThisWeek?: number;
  };
  students: any[];
  recentActivities: any[];
  pendingRegistrations: any[];
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function shortStudentName(student: any): string {
  const rawName = student?.ho_ten || student?.nguoi_dung?.ho_ten || student?.mssv || '?';
  const parts = String(rawName).trim().split(/\s+/).filter(Boolean);
  return parts.slice(-2).join(' ') || '?';
}

export default function TeacherChartsSection({
  stats,
  students,
  recentActivities,
  pendingRegistrations
}: TeacherChartsSectionProps) {
  const workloadData = useMemo(() => {
    const pendingActivitiesCount = recentActivities?.length || 0;
    const pendingRegistrationsCount = pendingRegistrations?.length || 0;
    const approvedThisWeek = toNumber(stats?.approvedThisWeek);

    return [
      {
        name: 'HĐ chờ duyệt',
        value: pendingActivitiesCount,
        color: WORKLOAD_COLORS.pendingActivities
      },
      {
        name: 'ĐK chờ duyệt',
        value: pendingRegistrationsCount,
        color: WORKLOAD_COLORS.pendingRegistrations
      },
      {
        name: 'Đã duyệt tuần',
        value: approvedThisWeek,
        color: WORKLOAD_COLORS.approvedThisWeek
      }
    ];
  }, [pendingRegistrations, recentActivities, stats?.approvedThisWeek]);

  const topStudentsBar = useMemo(() => {
    return (students || [])
      .map((student) => ({
        name: shortStudentName(student),
        value: toNumber(student?.diem_rl)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [students]);

  const totalWorkload = workloadData.reduce((sum, item) => sum + item.value, 0);
  const avgClassScore = toNumber(stats?.avgClassScore);
  const participationRate = toNumber(stats?.participationRate);
  const hasAnyData = totalWorkload > 0 || topStudentsBar.some((item) => item.value > 0) || avgClassScore > 0 || participationRate > 0;

  if (!hasAnyData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-400/10">
            <PieIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tổng quan xử lý</h3>
            <p className="text-[10px] text-slate-400">Hoạt động và đăng ký cần theo dõi</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <PointsDonutChart data={workloadData} totalLabel="Tổng" totalValue={totalWorkload} size={180} />
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {workloadData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-500 dark:text-slate-400">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-400/10">
            <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Top sinh viên</h3>
            <p className="text-[10px] text-slate-400">Điểm rèn luyện cao nhất lớp</p>
          </div>
        </div>

        <ActivityBarChart data={topStudentsBar} height={200} yAxisLabel="Điểm" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800 md:col-span-2 xl:col-span-1">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-400/10">
            <Target className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Hiệu suất lớp</h3>
            <p className="text-[10px] text-slate-400">Điểm trung bình và mức tham gia</p>
          </div>
        </div>

        <div className="space-y-4">
          <StatsProgressBar
            label="Điểm trung bình"
            value={avgClassScore}
            max={100}
            color="#6366F1"
            suffix="đ"
            showPercentage={false}
          />
          <StatsProgressBar
            label="Tỷ lệ tham gia"
            value={participationRate}
            max={100}
            color="#10B981"
            suffix="%"
            showPercentage={false}
          />
          <StatsProgressBar
            label="Việc cần duyệt"
            value={toNumber(stats?.pendingApprovals)}
            max={Math.max(toNumber(stats?.pendingApprovals), 10)}
            color="#F59E0B"
            showPercentage={false}
          />
        </div>
      </div>
    </div>
  );
}
