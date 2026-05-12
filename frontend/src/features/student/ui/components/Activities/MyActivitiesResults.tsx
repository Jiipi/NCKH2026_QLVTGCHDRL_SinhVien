import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MyActivityCard from './MyActivityCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export default function MyActivitiesResults({
  viewMode,
  paginatedItems = [],
  currentItemsCount = 0,
  filteredTotal = 0,
  query,
  activeFilterCount = 0,
  status,
  pagination,
  onPageChange,
  onLimitChange,
  onViewDetail,
  onShowQr,
  onCancel,
  canShowQr,
  isWritable
}) {
  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* Count label */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Tìm thấy <span className="text-slate-900 dark:text-white font-bold">{currentItemsCount}</span> hoạt động
        </span>
        {(query || activeFilterCount > 0) && (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">(lọc từ {filteredTotal})</span>
        )}
      </div>

      {/* Card Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
        >
          {paginatedItems.map((activity, idx) => (
            <motion.div key={activity.id || activity.hd_id || idx} variants={itemVariants}>
              <MyActivityCard
                activity={activity}
                status={status}
                mode={viewMode}
                onViewDetail={onViewDetail}
                onShowQr={onShowQr}
                onCancel={onCancel}
                canShowQr={canShowQr}
                isWritable={isWritable}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {pagination?.total > 0 && (
        <div className="mt-auto flex flex-col items-stretch gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 sm:pt-6">
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
          />
          <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50 sm:justify-start sm:py-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Hiển thị:</span>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
              className="mobile-input bg-transparent text-xs font-semibold text-slate-900 focus:outline-none dark:text-white cursor-pointer"
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
    <div className="flex items-center justify-center gap-1.5 overflow-x-auto px-1">
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

      <div className="flex items-center gap-1.5 px-1 sm:px-2">
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
              className={`h-10 min-w-10 rounded-lg px-2 text-sm font-semibold shadow-sm transition-colors ${
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
      className={`touch-target flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-semibold shadow-sm transition-colors ${
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
