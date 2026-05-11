import React, { useMemo } from 'react';
import { Award, Target } from 'lucide-react';
import { PointsDonutChart, StatsProgressBar } from '../../../../../shared/ui/charts';

const TYPE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];

interface StudentChartsSectionProps {
  activities: any[];
  summary: {
    totalPoints: number;
    activitiesJoined: number;
    progress: number;
    targetPoints: number;
    classRank: number;
    totalStudents: number;
    goalText: string;
  };
}

export default function StudentChartsSection({ activities, summary }: StudentChartsSectionProps) {
  // Compute points by activity type from activities list
  const pointsByType = useMemo(() => {
    const map: Record<string, number> = {};
    (activities || []).forEach((act: any) => {
      if (act.trang_thai_dk !== 'da_tham_gia') return;
      const typeName = act.hoat_dong?.loai_hd?.ten_loai_hd || 'Khác';
      const points = Number(act.diem_rl || act.hoat_dong?.diem_rl || 0);
      map[typeName] = (map[typeName] || 0) + points;
    });
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: TYPE_COLORS[i % TYPE_COLORS.length]
    }));
  }, [activities]);

  if (summary.totalPoints === 0 && pointsByType.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Chart 1: Donut — Phân bổ điểm theo loại */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-400/10">
            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Phân bổ điểm rèn luyện</h3>
            <p className="text-[10px] text-slate-400">Theo loại hoạt động</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <PointsDonutChart
            data={pointsByType}
            totalLabel="Tổng điểm"
            totalValue={summary.totalPoints}
            size={170}
          />
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {pointsByType.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px]">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-slate-500 dark:text-slate-400">{p.name} ({p.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Progress bars */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-400/10">
            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tiến độ rèn luyện</h3>
            <p className="text-[10px] text-slate-400">{summary.goalText}</p>
          </div>
        </div>

        <div className="space-y-4">
          <StatsProgressBar
            label="Tiến độ điểm"
            value={summary.totalPoints}
            max={summary.targetPoints}
            color="#6366F1"
          />
          <StatsProgressBar
            label="Mức Trung bình (50đ)"
            value={Math.min(summary.totalPoints, 50)}
            max={50}
            color={summary.totalPoints >= 50 ? '#10B981' : '#F59E0B'}
          />
          <StatsProgressBar
            label="Mức Khá (65đ)"
            value={Math.min(summary.totalPoints, 65)}
            max={65}
            color={summary.totalPoints >= 65 ? '#10B981' : '#F59E0B'}
          />
          <StatsProgressBar
            label="Mức Tốt (80đ)"
            value={Math.min(summary.totalPoints, 80)}
            max={80}
            color={summary.totalPoints >= 80 ? '#10B981' : '#F59E0B'}
          />
          <StatsProgressBar
            label="Mức Xuất sắc (90đ)"
            value={Math.min(summary.totalPoints, 90)}
            max={90}
            color={summary.totalPoints >= 90 ? '#10B981' : '#F59E0B'}
          />
        </div>

        {/* Class rank */}
        {summary.totalStudents > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-700/30">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Xếp hạng trong lớp</span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              {summary.classRank}/{summary.totalStudents}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
