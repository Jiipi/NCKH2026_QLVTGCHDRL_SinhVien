import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Trophy, XCircle, Activity } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
} as const;

export default function MyActivitiesHero({ stats, totalActivities }) {
  const safeStats = stats || { pending: [], approved: [], joined: [], rejected: [] };

  const statCards = [
    { icon: Clock, label: 'Chờ duyệt', value: safeStats.pending?.length || 0, iconColor: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-900/30' },
    { icon: CheckCircle, label: 'Đã duyệt', value: safeStats.approved?.length || 0, iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { icon: Trophy, label: 'Đã tham gia', value: safeStats.joined?.length || 0, iconColor: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-900/30' },
    { icon: XCircle, label: 'Bị từ chối', value: safeStats.rejected?.length || 0, iconColor: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-50 dark:bg-rose-900/30' },
  ];

  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Hoạt động của tôi</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi và quản lý hoạt động rèn luyện</p>
            </div>
          </div>
          <span className="rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {totalActivities} hoạt động
          </span>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ icon: Icon, label, value, iconColor, iconBg }) => (
          <motion.div
            key={label}
            variants={itemVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}
            className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-2xl transition-shadow dark:border-white/10 dark:bg-slate-950/45"
          >
            <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-0.5">{value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
