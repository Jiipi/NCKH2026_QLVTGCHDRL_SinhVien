import React from 'react';
import { Clock, CheckCircle, Trophy, Award } from 'lucide-react';
import { StudentPageHero } from '../../../../../shared/components/student';

export default function MyActivitiesHeader({ totalActivities, myRegistrations, totalPoints }) {
  const pending = myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length;
  const approved = myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length;
  const joined = myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length;

  return (
    <StudentPageHero
      eyebrow="Không gian lớp trưởng"
      title="Hoạt động của tôi"
      description="Theo dõi, quản lý và chinh phục các hoạt động rèn luyện bạn đã đăng ký."
      metrics={[
        { icon: Clock, label: 'Chờ duyệt', value: pending, tone: 'text-amber-600 dark:text-amber-300' },
        { icon: CheckCircle, label: 'Đã duyệt', value: approved, tone: 'text-emerald-600 dark:text-emerald-300' },
        { icon: Trophy, label: 'Hoàn thành', value: joined, tone: 'text-cyan-600 dark:text-cyan-300' },
        { icon: Award, label: 'Tổng điểm', value: totalPoints.toFixed(1), tone: 'text-indigo-600 dark:text-indigo-300' },
      ]}
    />
  );
}
