import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
} as const;

export default function ActivitiesListHero({ totalActivities = 0 }) {
  return (
    <motion.div
      className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/70 bg-white/55 p-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Khám phá hoạt động</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tìm kiếm và đăng ký hoạt động rèn luyện</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {totalActivities} hoạt động
          </span>
        </div>
      </div>
    </motion.div>
  );
}
