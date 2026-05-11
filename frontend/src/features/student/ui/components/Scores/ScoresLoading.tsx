import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Award } from 'lucide-react';
// Semester is now managed globally from sidebar

export default function ScoresLoading({ semester, onSemesterChange }) {
  return (
    <div className="space-y-6" data-ref="student-scores-refactored">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Điểm rèn luyện</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{semester || 'Chưa chọn HK'}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-16">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
        </motion.div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}
