import React from 'react';
import { Users, Activity, Award, TrendingUp, Download, FileText, BarChart3 } from 'lucide-react';
import { StudentPageHero } from '../../../../../shared/components/student';

export default function ReportsHeader({ overview, onExportExcel, onExportPDF }) {
  return (
    <StudentPageHero
      eyebrow="Không gian lớp trưởng"
      title="Báo cáo thống kê"
      description="Phân tích hoạt động, điểm rèn luyện, tỷ lệ tham gia và thành tích nổi bật của lớp."
      heroIcon={BarChart3}
      metrics={[
        { icon: Users, value: overview.totalStudents || 0, label: 'Sinh viên', tone: 'text-cyan-600 dark:text-cyan-300' },
        { icon: Activity, value: overview.totalActivities || 0, label: 'Hoạt động', tone: 'text-emerald-600 dark:text-emerald-300' },
        { icon: Award, value: overview.avgPoints || 0, label: 'Điểm TB', tone: 'text-amber-600 dark:text-amber-300' },
        { icon: TrendingUp, value: `${overview.participationRate || 0}%`, label: 'Tham gia', tone: 'text-rose-600 dark:text-rose-300' },
      ]}
      actions={(
        <>
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-0.5 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950"
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <FileText className="h-4 w-4" />
            PDF
          </button>
        </>
      )}
    />
  );
}
