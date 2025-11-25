import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MyActivityCard from './MyActivityCard';

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
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <span className="text-gray-700 font-semibold">
          Có <span className="text-purple-600 font-bold">{currentItemsCount}</span> hoạt động
        </span>
        {(query || activeFilterCount > 0) && (
          <span className="text-sm text-gray-500 italic">(Đã lọc từ {filteredTotal} hoạt động)</span>
        )}
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
        {paginatedItems.map((activity, idx) => (
          <MyActivityCard
            key={activity.id || activity.hd_id || idx}
            activity={activity}
            status={status}
            mode={viewMode}
            onViewDetail={onViewDetail}
            onShowQr={onShowQr}
            onCancel={onCancel}
            canShowQr={canShowQr}
            isWritable={isWritable}
          />
        ))}
      </div>

      {pagination?.total > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}

function Pagination({ pagination, onPageChange, onLimitChange }) {
  const totalPages = Math.ceil((pagination?.total || 0) / (pagination?.limit || 1));
  const currentPage = pagination?.page || 1;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-10">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {pagination?.total > 10 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Hiển thị mỗi trang:</span>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 text-sm font-medium"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
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
          {pageNumbers.map((pageNum) => {
            if (typeof pageNum === 'string') {
              return (
                <span key={pageNum} className="px-2 text-gray-400 font-bold">
                  ...
                </span>
              );
            }
            const isActive = pageNum === currentPage;
            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[44px] px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110 ring-2 ring-purple-300'
                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
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
      </div>
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
          : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-2 border-gray-200 shadow-md hover:shadow-lg'
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
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
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

