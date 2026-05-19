import { CheckCircle, ClipboardList, Clock, UserCheck, XCircle } from 'lucide-react';
import RolePageHero from '../../../../../shared/components/common/RolePageHero';

export default function RegistrationApprovalsHeroInline({ stats }) {
  const safeStats = {
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    joined: stats?.joined || 0,
    rejected: stats?.rejected || 0
  };

  return (
    <RolePageHero
      eyebrow="Không gian giảng viên"
      title="Phê duyệt đăng ký tham gia hoạt động"
      description="Quản lý đăng ký, duyệt sinh viên đủ điều kiện và theo dõi trạng thái tham gia."
      heroIcon={ClipboardList}
      metrics={[
        { icon: Clock, label: 'Chờ duyệt', value: safeStats.pending, tone: 'text-amber-600 dark:text-amber-300' },
        { icon: CheckCircle, label: 'Đã duyệt', value: safeStats.approved, tone: 'text-emerald-600 dark:text-emerald-300' },
        { icon: UserCheck, label: 'Đã tham gia', value: safeStats.joined, tone: 'text-cyan-600 dark:text-cyan-300' },
        { icon: XCircle, label: 'Từ chối', value: safeStats.rejected, tone: 'text-rose-600 dark:text-rose-300' },
      ]}
    />
  );
}
