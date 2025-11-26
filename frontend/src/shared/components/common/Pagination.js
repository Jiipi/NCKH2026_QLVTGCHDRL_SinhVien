import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Component - Pattern từ trang sinh viên
 * Sử dụng cho: danh sách hoạt động, hoạt động của tôi, phê duyệt đăng ký, sinh viên lớp
 */
export default function Pagination({ 
  pagination, 
  onPageChange, 
  onLimitChange,
  itemLabel = 'mục',
  showLimitSelector = true,
  className = ''
}) {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);
  const currentPage = page;

  // Luôn hiển thị pagination khi có dữ liệu, các nút sẽ tự disable khi không cần
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const leftSiblings = 2;
      const rightSiblings = 2;
      const leftBound = Math.max(2, currentPage - leftSiblings);
      const rightBound = Math.min(totalPages - 1, currentPage + rightSiblings);
      if (leftBound > 2) pages.push('ellipsis-left');
      for (let i = leftBound; i <= rightBound; i++) pages.push(i);
      if (rightBound < totalPages - 1) pages.push('ellipsis-right');
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = Math.min((currentPage - 1) * limit + 1, total);
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className={`mt-10 ${className}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Info về tổng số items */}
        <div className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-gray-900">{startItem}-{endItem}</span> trong tổng số <span className="font-semibold text-gray-900">{total}</span> {itemLabel}
        </div>

        {showLimitSelector && total > 10 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Hiển thị mỗi trang:</span>
            <select
              value={limit}
              onChange={(e) => {
                if (onLimitChange) {
                  onLimitChange(parseInt(e.target.value));
                }
              }}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300 text-sm font-medium"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        <div className={`transition-opacity duration-300 opacity-100`}>
          <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Trang đầu */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 shadow-md hover:shadow-lg'
            }`}
            title="Trang đầu"
          >
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-3" />
          </button>

          {/* Trước */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              currentPage <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 shadow-md hover:shadow-lg'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </button>

          {/* Số trang */}
          {pageNumbers.map((pageNum) => {
            if (typeof pageNum === 'string') {
              return (
                <span key={pageNum} className="px-2 text-gray-400 font-bold">
                  ...
                </span>
              );
            }
            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[44px] px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                  pageNum === currentPage
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110 ring-2 ring-blue-300'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Sau */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              currentPage >= totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 shadow-md hover:shadow-lg'
            }`}
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Trang cuối */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 shadow-md hover:shadow-lg'
            }`}
            title="Trang cuối"
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-3" />
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

