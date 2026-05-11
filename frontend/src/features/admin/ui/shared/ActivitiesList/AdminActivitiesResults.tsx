import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdminActivitiesCard from './AdminActivitiesCard';
import { Activity, PaginationData } from '../../../types';

interface AdminActivitiesResultsProps {
  filteredItems?: Activity[];
  viewMode: 'grid' | 'list';
  activitiesGridRef: React.RefObject<HTMLDivElement | null>;
  isTransitioning: boolean;
  onViewDetail: (activityId: string) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string, activityName?: string) => void | Promise<void>;
  onApprove: (activityId: string, activityName?: string) => void | Promise<void>;
  onReject: (activityId: string, activityName?: string) => void | Promise<void>;
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  scopeTab: string;
  isWritable?: boolean;
}

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

interface IconButtonProps {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  title?: string;
}

export default function AdminActivitiesResults({
  filteredItems = [],
  viewMode,
  activitiesGridRef,
  isTransitioning,
  onViewDetail,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  pagination,
  onPageChange,
  onLimitChange,
  scopeTab,
  isWritable = true
}: AdminActivitiesResultsProps): React.ReactElement {
  return (
    <div
      ref={activitiesGridRef}
      className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
    >
      {isTransitioning && (
        <div className="mb-4 flex items-center justify-center py-4">
          <div className="flex items-center gap-2 rounded-2xl border border-indigo-200/70 bg-indigo-50/70 px-4 py-2 shadow-sm backdrop-blur-xl dark:border-indigo-400/20 dark:bg-indigo-400/10">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-300 dark:border-t-transparent"></div>
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Đang tải...</span>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Có <span className="text-indigo-600 dark:text-indigo-300">{filteredItems.length}</span> hoạt động
            {scopeTab === 'all' ? ' trong hệ thống' : ' của lớp'}
          </span>
          {filteredItems.length <= pagination.limit && filteredItems.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Hiển thị đầy đủ
            </span>
          )}
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
        {filteredItems.map((activity, idx) => (
          <AdminActivitiesCard
            key={activity.id || idx}
            activity={activity}
            mode={viewMode}
            onViewDetail={onViewDetail}
            onEdit={onEdit}
            onDelete={onDelete}
            onApprove={onApprove}
            onReject={onReject}
            isWritable={isWritable}
          />
        ))}
      </div>

      {pagination.total > 0 && (
        <div className="mt-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {pagination.total > 10 && (
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-sm font-semibold text-slate-500 dark:text-slate-400">Hiển thị mỗi trang:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
                  className="rounded-2xl border border-white/70 bg-white/55 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-indigo-400/20"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Pagination
              pagination={pagination}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination({ pagination, onPageChange }: PaginationProps): React.ReactElement {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.page;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <IconButton
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        title="Trang đầu"
      >
        <ChevronLeft className="h-4 w-4" />
        <ChevronLeft className="h-4 w-4 -ml-3" />
      </IconButton>

      <IconButton
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Trước
      </IconButton>

      {pageNumbers.map((pageNum) =>
        typeof pageNum === 'string' ? (
          <span key={pageNum} className="px-2 font-bold text-slate-400 dark:text-slate-500">
            ...
          </span>
        ) : (
          <button
            key={`page-${pageNum}`}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-[44px] rounded-2xl px-4 py-2.5 font-bold transition-all duration-200 ${
              pageNum === currentPage
                ? 'scale-105 bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100/70 dark:ring-indigo-400/20'
                : 'border border-white/70 bg-white/55 text-slate-600 shadow-sm backdrop-blur-xl hover:bg-white/75 hover:text-indigo-600 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-indigo-300'
            }`}
          >
            {pageNum}
          </button>
        )
      )}

      <IconButton
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Sau
        <ChevronRight className="h-4 w-4" />
      </IconButton>

      <IconButton
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        title="Trang cuối"
      >
        <ChevronRight className="h-4 w-4" />
        <ChevronRight className="h-4 w-4 -ml-3" />
      </IconButton>
    </div>
  );
}

function IconButton({ children, disabled, onClick, title }: IconButtonProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 font-semibold transition-all duration-200 ${
        disabled
          ? 'cursor-not-allowed border border-white/50 bg-white/35 text-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-600'
          : 'border border-white/70 bg-white/55 text-slate-600 shadow-sm backdrop-blur-xl hover:bg-white/75 hover:text-indigo-600 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-indigo-300'
      }`}
    >
      {children}
    </button>
  );
}

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);
  const leftSiblings = 2;
  const rightSiblings = 2;
  const leftBound = Math.max(2, currentPage - leftSiblings);
  const rightBound = Math.min(totalPages - 1, currentPage + rightSiblings);
  if (leftBound > 2) pages.push('ellipsis-left');
  for (let i = leftBound; i <= rightBound; i += 1) pages.push(i);
  if (rightBound < totalPages - 1) pages.push('ellipsis-right');
  pages.push(totalPages);
  return pages;
}
