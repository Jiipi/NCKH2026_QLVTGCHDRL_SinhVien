import React from 'react';
import { Activity, AlertCircle, CheckCircle, ClipboardCheck, XCircle } from 'lucide-react';
import { AdminPageHero } from '../../../../../shared/components/admin';

interface AdminActivitiesHeroProps {
  totalActivities?: number;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  /** Set to true when the page is filtered to status=cho_duyet (approval workflow). */
  approvalMode?: boolean;
}

export default function AdminActivitiesHero({
  totalActivities = 0,
  pendingCount = 0,
  approvedCount = 0,
  rejectedCount = 0,
  approvalMode = false,
}: AdminActivitiesHeroProps): React.ReactElement {
  if (approvalMode) {
    return (
      <AdminPageHero
        eyebrow="Quản trị phê duyệt"
        title="Phê duyệt hoạt động"
        description="Xem và phê duyệt các hoạt động đang chờ duyệt trong toàn hệ thống."
        heroIcon={ClipboardCheck}
        metrics={[
          { icon: AlertCircle, label: 'Chờ duyệt', value: pendingCount, tone: 'text-amber-600 dark:text-amber-300' },
          { icon: CheckCircle, label: 'Đã duyệt', value: approvedCount, tone: 'text-emerald-600 dark:text-emerald-300' },
          { icon: XCircle, label: 'Từ chối', value: rejectedCount, tone: 'text-rose-600 dark:text-rose-300' },
        ]}
      />
    );
  }

  return (
    <AdminPageHero
      eyebrow="Không gian quản trị"
      title="Quản lý hoạt động"
      description="Theo dõi, lọc, duyệt và quản lý hoạt động rèn luyện theo học kỳ trong không gian quản trị tập trung."
      heroIcon={Activity}
      metrics={[
        { icon: Activity, label: 'Tổng hoạt động', value: totalActivities, tone: 'text-slate-950 dark:text-white' },
        { icon: AlertCircle, label: 'Chờ duyệt', value: pendingCount, tone: 'text-amber-600 dark:text-amber-300' },
        { icon: CheckCircle, label: 'Đã duyệt', value: approvedCount, tone: 'text-emerald-600 dark:text-emerald-300' },
        { icon: XCircle, label: 'Từ chối', value: rejectedCount, tone: 'text-rose-600 dark:text-rose-300' }
      ]}
    />
  );
}
