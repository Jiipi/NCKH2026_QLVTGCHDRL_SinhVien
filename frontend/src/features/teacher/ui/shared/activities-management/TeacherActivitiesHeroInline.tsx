import { Activity, BookOpen, Tag } from 'lucide-react';
import RolePageHero from '../../../../../shared/components/common/RolePageHero';

export default function TeacherActivitiesHeroInline({
  stats,
  activityTypesCount
}) {
  return (
    <RolePageHero
      eyebrow="Không gian giảng viên"
      title="Danh sách hoạt động"
      description="Xem, duyệt và quản lý hoạt động rèn luyện theo học kỳ."
      heroIcon={BookOpen}
      metrics={[
        { icon: Activity, label: 'Tổng hoạt động', value: stats?.total || 0, tone: 'text-indigo-600 dark:text-indigo-300' },
        { icon: Tag, label: 'Loại hoạt động', value: activityTypesCount || 0, tone: 'text-purple-600 dark:text-purple-300' },
      ]}
    />
  );
}
