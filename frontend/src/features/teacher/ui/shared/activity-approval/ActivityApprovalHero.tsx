import { AlertCircle, CheckCircle, ClipboardCheck, Clock, XCircle } from 'lucide-react';
import RolePageHero from '../../../../../shared/components/common/RolePageHero';

export default function ActivityApprovalHero({ stats }) {
  const safeStats = {
    total: stats?.total || 0,
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    rejected: stats?.rejected || 0
  };

  return (
    <RolePageHero
      eyebrow="Không gian giảng viên"
      title="Phê duyệt hoạt động"
      description="Xem và phê duyệt các hoạt động do sinh viên trong lớp tạo."
      heroIcon={ClipboardCheck}
      className="mb-6"
      metrics={[
        { icon: Clock, label: 'Tổng hoạt động', value: safeStats.total, tone: 'text-cyan-600 dark:text-cyan-300' },
        { icon: AlertCircle, label: 'Chờ duyệt', value: safeStats.pending, tone: 'text-amber-600 dark:text-amber-300' },
        { icon: CheckCircle, label: 'Đã duyệt', value: safeStats.approved, tone: 'text-emerald-600 dark:text-emerald-300' },
        { icon: XCircle, label: 'Từ chối', value: safeStats.rejected, tone: 'text-rose-600 dark:text-rose-300' },
      ]}
    />
  );
}
