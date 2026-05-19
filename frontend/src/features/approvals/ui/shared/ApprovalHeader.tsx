import React from 'react';
import { CheckCircle, Clock, Trophy, Users } from 'lucide-react';
import { StudentPageHero } from '../../../../shared/components/student';

export default function ApprovalHeader({ stats }) {
    return (
        <StudentPageHero
            eyebrow="Không gian lớp trưởng"
            title="Phê duyệt đăng ký"
            description="Quản lý và phê duyệt đăng ký tham gia hoạt động của sinh viên trong lớp."
            heroIcon={CheckCircle}
            metrics={[
                { icon: Users, label: 'Tổng số', value: stats.total || 0, tone: 'text-cyan-600 dark:text-cyan-300' },
                { icon: Clock, label: 'Chờ duyệt', value: stats.pending || 0, tone: 'text-amber-600 dark:text-amber-300' },
                { icon: CheckCircle, label: 'Đã duyệt', value: stats.approved || 0, tone: 'text-emerald-600 dark:text-emerald-300' },
                { icon: Trophy, label: 'Đã tham gia', value: stats.participated || 0, tone: 'text-indigo-600 dark:text-indigo-300' },
            ]}
        />
    );
}

