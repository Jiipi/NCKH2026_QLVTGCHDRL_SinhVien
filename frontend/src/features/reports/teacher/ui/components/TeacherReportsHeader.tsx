import React from 'react';
import { Activity, BarChart3, FileText, TrendingUp, Users } from 'lucide-react';
import RolePageHero from '../../../../../shared/components/common/RolePageHero';

export default function TeacherReportsHeader({ stats = {} }: { stats?: any }) {
  return (
    <RolePageHero
      eyebrow="Không gian giảng viên"
      title="Báo cáo & Thống kê"
      description="Xem thống kê chi tiết, phân tích hoạt động và xuất báo cáo theo học kỳ hoặc khoảng thời gian."
      heroIcon={BarChart3}
      className="mb-6"
      metrics={[
        { icon: Activity, label: 'Hoạt động', value: stats.totalActivities || 0, tone: 'text-indigo-600 dark:text-indigo-300' },
        { icon: Users, label: 'Sinh viên', value: stats.totalStudents || 0, tone: 'text-teal-600 dark:text-teal-300' },
        { icon: TrendingUp, label: 'Tham gia', value: `${Math.round(Number(stats.participationRate || 0))}%`, tone: 'text-rose-600 dark:text-rose-300' },
        { icon: FileText, label: 'Điểm TB', value: Number(stats.averageScore || 0).toFixed(1), tone: 'text-amber-600 dark:text-amber-300' },
      ]}
    />
  );
}
