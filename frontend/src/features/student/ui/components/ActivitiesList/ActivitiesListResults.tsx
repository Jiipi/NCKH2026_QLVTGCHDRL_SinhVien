import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivitiesListCard from './ActivitiesListCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 350, damping: 25 } }
};

export default function ActivitiesListResults({
  filteredItems = [],
  viewMode,
  activitiesGridRef,
  isTransitioning,
  role,
  isWritable,
  onRegister,
  onViewDetail,
  pagination,
  onPageChange,
  onLimitChange
}) {
  return (
    <div ref={activitiesGridRef} className="relative flex flex-col flex-1">
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Đang tải danh sách...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-slate-600 dark:text-slate-400 text-sm">
            Tìm thấy <span className="text-slate-900 dark:text-white font-bold">{filteredItems.length}</span> hoạt động
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
        >
          {filteredItems.map((activity, idx) => (
            <motion.div
              key={activity.id || idx}
              variants={itemVariants}
            >
              <ActivitiesListCard
                activity={activity}
                mode={viewMode}
                role={role}
                isWritable={isWritable}
                onRegister={onRegister}
                onViewDetail={onViewDetail}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {pagination.total > 0 && (
        <div className="mt-auto pt-6 flex items-center justify-center gap-4 flex-wrap border-t border-slate-200 dark:border-slate-800">
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
          />
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Hiển thị:</span>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size} className="text-slate-900">
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination({ pagination, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  const currentPage = pagination.page;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      <IconButton
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        title="Trang đầu"
      >
        <ChevronLeft className="h-4 w-4" />
        <ChevronLeft className="h-4 w-4 -ml-2" />
      </IconButton>

      <IconButton
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </IconButton>

      <div className="flex items-center gap-1.5 px-2">
        {pageNumbers.map((pageNum, idx) =>
          typeof pageNum === 'string' ? (
            <span key={`${pageNum}-${idx}`} className="px-2 text-slate-400 font-medium">
              ...
            </span>
          ) : (
            <motion.button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`min-w-[40px] h-10 px-2 rounded-lg font-semibold text-sm transition-colors shadow-sm ${
                pageNum === currentPage
                  ? 'bg-blue-600 text-white border border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {pageNum}
            </motion.button>
          )
        )}
      </div>

      <IconButton
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </IconButton>

      <IconButton
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        title="Trang cuối"
      >
        <ChevronRight className="h-4 w-4" />
        <ChevronRight className="h-4 w-4 -ml-2" />
      </IconButton>
    </div>
  );
}

interface IconButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
}

function IconButton({ children, disabled, onClick, title }: IconButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`flex items-center justify-center h-10 w-10 rounded-lg font-semibold transition-colors shadow-sm ${
        disabled
          ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border border-transparent cursor-not-allowed'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer'
      }`}
    >
      {children}
    </motion.button>
  );
}

function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);
  const leftBound = Math.max(2, currentPage - 1);
  const rightBound = Math.min(totalPages - 1, currentPage + 1);
  
  if (leftBound > 2) pages.push('ellipsis-left');
  for (let i = leftBound; i <= rightBound; i += 1) pages.push(i);
  if (rightBound < totalPages - 1) pages.push('ellipsis-right');
  
  pages.push(totalPages);
  return pages;
}

