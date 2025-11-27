import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdminActivitiesCard from './AdminActivitiesCard';

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
}) {
  return (
    <div
      ref={activitiesGridRef}
      className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
    >
      {isTransitioning && (
        <div className="flex items-center justify-center py-4 mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
            <span className="text-sm text-indigo-700 font-medium">Đang tải...</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-semibold">
            Có <span className="text-indigo-600 font-bold">{filteredItems.length}</span> hoạt động
            {scopeTab === 'all' ? ' trong hệ thống' : ' của lớp'}
          </span>
          {filteredItems.length <= pagination.limit && filteredItems.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
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
                <span className="text-sm text-gray-600 whitespace-nowrap">Hiển thị mỗi trang:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200 hover:border-indigo-300 text-sm font-medium"
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

function Pagination({ pagination, onPageChange }) {
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
          <span key={pageNum} className="px-2 text-gray-400 font-bold">
            ...
          </span>
        ) : (
          <button
            key={`page-${pageNum}`}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-[44px] px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${
              pageNum === currentPage
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-110 ring-2 ring-indigo-300'
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md'
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

function IconButton({ children, disabled, onClick, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
        disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-2 border-gray-200 shadow-md hover:shadow-lg'
      }`}
    >
      {children}
    </button>
  );
}

function getPageNumbers(currentPage, totalPages) {
  const pages = [];
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
