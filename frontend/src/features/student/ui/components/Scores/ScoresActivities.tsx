import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, Award, ExternalLink } from 'lucide-react';
import ScoreCard from './ScoreCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export default function ScoresActivities({ activities = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const totalPoints = activities.reduce((sum, a) => sum + (a.diem || a.diem_rl || a.points || 0), 0);
  const INITIAL_SHOW = 5;
  const displayItems = showAll ? activities : activities.slice(0, INITIAL_SHOW);
  const hasMore = activities.length > INITIAL_SHOW;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
    >
      {/* Header — clickable to toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 sm:p-5 cursor-pointer"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
              Lịch sử hoạt động đã tham gia
            </h3>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {activities.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full">
              {activities.length} hoạt động • Tổng +{totalPoints} điểm
            </span>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </motion.div>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-4 pb-4 dark:border-slate-700/50 sm:px-5 sm:pb-5">
              {activities.length > 0 ? (
                <>
                  <motion.div
                    className="space-y-3 mt-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {displayItems.map((activity, index) => (
                      <motion.div key={activity.id || index} variants={itemVariants}>
                        <ScoreCard activity={activity} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Show more / Show less */}
                  {hasMore && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowAll(!showAll); }}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {showAll ? 'Thu gọn' : `Xem tất cả lịch sử (${activities.length})`}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                    <Award className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Chưa có hoạt động nào trong kỳ này</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Các hoạt động bạn đã tham gia sẽ hiển thị ở đây</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
