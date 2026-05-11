import React, { useState, useEffect } from 'react';
import Pagination from '../Pagination';
import { usePaginatedTable } from '../../hooks/usePagination';

// Interface for table data response
interface TableDataResponse {
  users?: Array<{ id?: string | number;[key: string]: unknown }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  [key: string]: unknown;
}

/**
 * Generic admin table component with pagination
 * @param {Object} props - Component props
 * @param {Function} props.fetchData - Function to fetch data
 * @param {Array} props.columns - Table column definitions
 * @param {Object} props.initialParams - Initial pagination parameters
 * @param {Function} props.renderRow - Function to render table row
 * @param {string} props.title - Table title
 * @param {Object} props.filters - Additional filter components
 */
export default function AdminTable({
  fetchData,
  columns = [],
  initialParams = {},
  renderRow,
  title = 'Danh sách',
  filters = null,
  className = ''
}) {
  const {
    pagination,
    loading,
    data,
    error,
    handlePageChange,
    handleSearch,
    handlePageSizeChange,
    fetchData: fetchTableData
  } = usePaginatedTable<TableDataResponse>(fetchData, initialParams);

  const [searchTerm, setSearchTerm] = useState(pagination.search || '');

  // Fetch data on component mount and when pagination changes
  useEffect(() => {
    fetchTableData();
  }, [pagination.page, pagination.limit]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== pagination.search) {
        handleSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, pagination.search, handleSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const onPageSizeChange = (e) => {
    handlePageSizeChange(parseInt(e.target.value));
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Lỗi tải dữ liệu</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => fetchTableData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-200/60 px-6 py-4 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="rounded-xl border border-white/60 bg-white/60 py-2 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-sm backdrop-blur-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Page size selector */}
            <select
              value={pagination.limit}
              onChange={onPageSizeChange}
              className="rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </div>
        </div>

        {/* Additional filters */}
        {filters && (
          <div className="mt-4">
            {filters}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="px-6 py-8 text-center">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tải dữ liệu...
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && data && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/60 dark:divide-white/10">
              <thead className="bg-slate-50/70 dark:bg-white/5">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 bg-white/45 dark:divide-white/10 dark:bg-transparent">
                {data.users && data.users.length > 0 ? (
                  data.users.map((item, index) => (
                    <tr key={item.id || index} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
                      {renderRow ? renderRow(item, index) : (
                        columns.map((column, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {column.accessor ? item[column.accessor] : column.render ? column.render(item) : ''}
                          </td>
                        ))
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination && (
            <Pagination
              pagination={data.pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
