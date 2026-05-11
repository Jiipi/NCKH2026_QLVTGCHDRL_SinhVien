import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, AlertCircle } from 'lucide-react';
import AcademicStatCard from '../../../../../shared/components/common/AcademicStatCard';

interface MonitorClassStatsProps {
  totalStudents: number;
  totalActivities: number;
  pendingApprovals: number;
  formatNumber: (n: number) => string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
} as const;

export default function MonitorClassStats({
  totalStudents,
  totalActivities,
  pendingApprovals,
  formatNumber
}: MonitorClassStatsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <motion.div variants={itemVariants}>
        <AcademicStatCard
          icon={Users}
          value={formatNumber(totalStudents)}
          label="Sinh viên lớp học"
          iconColor="text-blue-600 dark:text-blue-400"
          iconBgColor="bg-blue-50 dark:bg-blue-900/30"
          subtitle="Sĩ số lớp"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <AcademicStatCard
          icon={Activity}
          value={formatNumber(totalActivities)}
          label="Hoạt động lớp"
          iconColor="text-purple-600 dark:text-purple-400"
          iconBgColor="bg-purple-50 dark:bg-purple-900/30"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <AcademicStatCard
          icon={AlertCircle}
          value={formatNumber(pendingApprovals)}
          label="Chờ duyệt"
          iconColor={pendingApprovals > 0 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}
          iconBgColor={pendingApprovals > 0 ? "bg-orange-50 dark:bg-orange-900/30" : "bg-emerald-50 dark:bg-emerald-900/30"}
          subtitle={pendingApprovals > 0 ? 'Cần xử lý' : 'Đã xử lý hết'}
        />
      </motion.div>
    </motion.div>
  );
}
