import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const, staggerChildren: 0.1, delayChildren: 0.2 }
  }
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const }
  }
} as const;

interface ActivityData {
  ten_hd?: string;
  name?: string;
  diem_rl?: number;
  dia_diem?: string;
}

interface UpcomingActivityItem {
  id?: string | number;
  activity?: ActivityData;
  hoat_dong?: ActivityData;
  ngay_bd?: string;
  dia_diem?: string;
}

interface UpcomingActivitiesProps {
  upcoming?: UpcomingActivityItem[];
  onViewAll?: () => void;
  onSelectActivity?: (activity: UpcomingActivityItem) => void;
  formatNumber?: (value: number) => string | number;
}

export default function UpcomingActivities({
  upcoming = [],
  onViewAll = () => { },
  onSelectActivity = () => { },
  formatNumber = (value) => value
}: UpcomingActivitiesProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Calendar className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wide">
            Hoạt động sắp tới
          </h3>
        </div>
        <motion.button
          onClick={onViewAll}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          Xem tất cả →
        </motion.button>
      </div>

      {/* Activity Cards — 2-column grid with stagger animation */}
      {upcoming.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {upcoming.slice(0, 4).map((activity, idx) => {
            const activityData: ActivityData = (activity.activity || activity.hoat_dong || activity) as ActivityData;
            const startDate = activity.ngay_bd ? new Date(activity.ngay_bd) : null;

            return (
              <motion.div
                key={activity.id || idx}
                className="cursor-pointer rounded-2xl border border-white/60 bg-white/45 p-4 shadow-sm backdrop-blur-xl transition-all hover:border-indigo-200 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                  borderColor: '#93c5fd',
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                onClick={() => onSelectActivity(activity)}
              >
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">
                  {startDate ? startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                </p>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug mb-3 line-clamp-2">
                  {activityData.ten_hd || activityData.name || 'Hoạt động'}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    +{formatNumber(activityData.diem_rl || 0)}đ RL
                  </span>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); onSelectActivity(activity); }}
                    className="px-3 py-1 text-xs font-medium bg-blue-800 dark:bg-blue-600 text-white rounded-md hover:bg-blue-900 dark:hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Đăng ký
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 mb-2"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Calendar className="w-5 h-5" />
          </motion.div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có hoạt động sắp tới</p>
        </motion.div>
      )}
    </motion.div>
  );
}
