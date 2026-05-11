import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function ActivitiesListLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
      </motion.div>
      <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải danh sách...</p>
    </div>
  );
}
