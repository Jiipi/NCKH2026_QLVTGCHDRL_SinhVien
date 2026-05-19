import React from 'react';
import { Award, Shield, Sparkles } from 'lucide-react';
import { AdminPageHero } from '../../../../../shared/components/admin';

interface UserProfile {
  ho_ten?: string;
  name?: string;
}

interface AdminDashboardHeroProps {
  userProfile?: UserProfile | null;
}

export default function AdminDashboardHero({ userProfile }: AdminDashboardHeroProps) {
  const adminName = userProfile?.ho_ten || userProfile?.name || 'Quản trị viên';

  return (
    <AdminPageHero
      eyebrow="Không gian quản trị"
      title={`Xin chào, ${adminName}!`}
      description="Theo dõi vận hành hệ thống, phê duyệt đăng ký và quản lý dữ liệu rèn luyện tập trung."
      heroIcon={Shield}
      chips={[
        { icon: Sparkles, label: 'Quản trị viên' },
        { icon: Award, label: 'Toàn quyền hệ thống' }
      ]}
    />
  );
}
