import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, CheckCircle, XCircle } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
} as const;

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: 'easeOut' as const,
    }
  })
};

interface ActivityData {
  ten_hd?: string;
  name?: string;
  diem_rl?: number;
  dia_diem?: string;
  location?: string;
  ngay_bd?: string;
  ngay_tham_gia?: string;
}

interface ActivityItem {
  id?: string | number;
  activity_id?: string | number;
  activity?: ActivityData;
  hoat_dong?: ActivityData;
  trang_thai_dk?: string;
  status?: string;
  dia_diem?: string;
  location?: string;
  ngay_tham_gia?: string;
  ngay_bd?: string;
  diem_rl?: number;
}

interface MyActivities {
  all?: ActivityItem[];
  pending?: ActivityItem[];
  approved?: ActivityItem[];
  joined?: ActivityItem[];
  rejected?: ActivityItem[];
}

interface RecentActivitiesProps {
  recentActivities?: ActivityItem[];
  recentFilter?: string;
  onFilterChange?: (key: string) => void;
  onViewAll?: () => void;
  onSelectActivity?: (activity: ActivityItem) => void;
  myActivities?: MyActivities;
  formatNumber?: (value: number) => string | number;
}

export default function RecentActivities({
  recentActivities = [],
  recentFilter = 'all',
  onFilterChange = () => {},
  onViewAll = () => {},
  onSelectActivity = () => {},
  myActivities = {},
  formatNumber = (value) => value
}: RecentActivitiesProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: -15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Activity className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wide">
            Hoạt động đã tham gia gần đây
          </h3>
        </div>
        <motion.button
          onClick={onViewAll}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          Xem tất cả lịch sử →
        </motion.button>
      </div>

      {/* List with staggered slide-in animation */}
      {recentActivities.length > 0 ? (
        <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-700">
          {recentActivities.slice(0, 6).map((activity: ActivityItem, idx: number) => {
            const activityData: ActivityData = (activity.activity || activity.hoat_dong || activity) as ActivityData;
            const displayDate =
              activity.ngay_tham_gia ||
              activity.ngay_bd ||
              activityData.ngay_bd ||
              activityData.ngay_tham_gia ||
              activity.hoat_dong?.ngay_bd ||
              null;
            const points = activityData.diem_rl || activity.diem_rl || 0;
            const status = normalizeStatus(activity.trang_thai_dk || activity.status);

            return (
              <motion.div
                key={activity.id || activity.activity_id || idx}
                className="-mx-2 flex cursor-pointer items-center justify-between rounded-2xl border border-transparent px-3 py-3 transition-all hover:border-white/60 hover:bg-white/55 hover:shadow-sm dark:hover:border-white/10 dark:hover:bg-white/5"
                custom={idx}
                variants={listItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ x: 4, backgroundColor: 'rgba(241,245,249,0.8)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => onSelectActivity(activity)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Activity info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {activityData.ten_hd || activityData.name || 'Hoạt động'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {displayDate ? new Date(displayDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Status badge + Points */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <motion.span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusBadge(status)}`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 + 0.3, type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    {getStatusLabel(status)}
                  </motion.span>
                  <motion.span
                    className="text-sm font-bold text-blue-700 dark:text-blue-400"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 + 0.4 }}
                  >
                    +{formatNumber(points)}đ
                  </motion.span>
                </div>
              </motion.div>
            );
          })}
        </div>
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
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Activity className="w-5 h-5" />
          </motion.div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có hoạt động nào</p>
        </motion.div>
      )}
    </motion.div>
  );
}

function normalizeStatus(status = '') {
  const value = status.toLowerCase();
  if (value === 'cho_duyet' || value === 'pending') return 'pending';
  if (value === 'da_duyet' || value === 'approved') return 'approved';
  if (value === 'da_tham_gia' || value === 'participated' || value === 'attended') return 'joined';
  if (value === 'tu_choi' || value === 'rejected') return 'rejected';
  return 'pending';
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'joined': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
    case 'approved': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    case 'pending': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    case 'rejected': return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    default: return 'bg-slate-100 dark:bg-slate-700 text-slate-500';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'joined': return 'Đã tham gia';
    case 'approved': return 'Đã duyệt';
    case 'pending': return 'Chờ duyệt';
    case 'rejected': return 'Từ chối';
    default: return 'N/A';
  }
}
