import React from 'react';
import { BarChart3, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { AdminPageHero } from '../../../../../shared/components/admin';

interface AdminReportsStats {
  total?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
}

interface AdminReportsHeaderProps {
  stats?: AdminReportsStats;
}

export default function AdminReportsHeader({ stats = {} }: AdminReportsHeaderProps) {
  const safe = {
    total: stats?.total || 0,
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    rejected: stats?.rejected || 0,
  };

  return (
    <AdminPageHero
      eyebrow="Không gian quản trị"
      title="Báo cáo hệ thống"
      description="Thống kê tổng quan hoạt động và đăng ký trong hệ thống."
      heroIcon={BarChart3}
      metrics={[
        { icon: BarChart3, label: 'Tổng số', value: safe.total, tone: 'text-slate-950 dark:text-white' },
        { icon: Sparkles, label: 'Chờ duyệt', value: safe.pending, tone: 'text-amber-600 dark:text-amber-300' },
        { icon: TrendingUp, label: 'Đã duyệt', value: safe.approved, tone: 'text-emerald-600 dark:text-emerald-300' },
        { icon: FileText, label: 'Từ chối', value: safe.rejected, tone: 'text-rose-600 dark:text-rose-300' },
      ]}
    />
  );
}
