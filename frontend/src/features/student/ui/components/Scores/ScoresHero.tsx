import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Calendar, TrendingUp } from 'lucide-react';
// Semester is now managed globally from sidebar
import AcademicStatCard from '../../../../../shared/components/common/AcademicStatCard';

interface ScoresStats {
  totalActivities?: number;
  averagePoints?: number;
}

interface ClassRankings {
  my_rank_in_class?: number;
}

interface ScoresData {
  class_rankings?: ClassRankings;
}

interface ScoresHeroProps {
  semester?: string;
  onSemesterChange?: (value: string) => void;
  currentScore?: number;
  stats?: ScoresStats;
  data?: ScoresData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
} as const;

export default function ScoresHero({ semester, onSemesterChange, currentScore, stats = {}, data }: ScoresHeroProps) {
  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Điểm rèn luyện</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi và phân tích kết quả rèn luyện</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{semester || 'Chưa chọn HK'}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div variants={itemVariants}>
          <AcademicStatCard icon={Trophy} value={currentScore ?? '-'} label="Tổng điểm" iconColor="text-amber-600" iconBgColor="bg-amber-50" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AcademicStatCard
            icon={Award}
            value={data?.class_rankings?.my_rank_in_class ? `#${data.class_rankings.my_rank_in_class}` : '-'}
            label="Xếp hạng"
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AcademicStatCard icon={Calendar} value={stats.totalActivities ?? '-'} label="Hoạt động" iconColor="text-blue-600" iconBgColor="bg-blue-50" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AcademicStatCard
            icon={TrendingUp}
            value={stats.averagePoints ? stats.averagePoints.toFixed(1) : '-'}
            label="Trung bình"
            iconColor="text-pink-600"
            iconBgColor="bg-pink-50"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
