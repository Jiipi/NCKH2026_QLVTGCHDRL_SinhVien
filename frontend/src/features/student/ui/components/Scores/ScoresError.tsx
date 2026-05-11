import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function ScoresError({ message }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-center gap-3"
    >
      <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex-shrink-0">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">Đã xảy ra lỗi</p>
        <p className="text-sm text-amber-700 dark:text-amber-400">{message}</p>
      </div>
    </motion.div>
  );
}
