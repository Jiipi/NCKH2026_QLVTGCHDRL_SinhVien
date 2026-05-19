import { GraduationCap, Users } from 'lucide-react';
import RolePageHero from '../../../../../shared/components/common/RolePageHero';

export function StudentHeader({ totalStudents = 0, totalClasses = 0 }) {
  return (
    <RolePageHero
      eyebrow="Không gian giảng viên"
      title="Quản lý sinh viên & lớp"
      description="Xem danh sách sinh viên, lớp phụ trách và phân công lớp trưởng trong một không gian thống nhất."
      heroIcon={GraduationCap}
      metrics={[
        { icon: GraduationCap, label: 'Lớp phụ trách', value: totalClasses, tone: 'text-indigo-600 dark:text-indigo-300' },
        { icon: Users, label: 'Sinh viên', value: totalStudents, tone: 'text-teal-600 dark:text-teal-300' },
      ]}
    />
  );
}

export default StudentHeader;
