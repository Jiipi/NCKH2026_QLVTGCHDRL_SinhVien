import React from 'react';
import { Search, Filter, Grid3x3, List } from 'lucide-react';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'name';

interface ActivityTypeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  total: number;
  filtered: number;
}

function ActivityTypeFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  total,
  filtered
}: ActivityTypeFiltersProps): React.JSX.Element {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchChange(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    onSortChange(e.target.value as SortOption);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            placeholder="Tìm kiếm theo tên loại hoạt động..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer appearance-none min-w-[180px]"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="name">Tên A-Z</option>
          </select>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-3 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white shadow text-indigo-600 border border-indigo-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Xem dạng lưới"
          >
            <Grid3x3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-3 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white shadow text-indigo-600 border border-indigo-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Xem dạng danh sách"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-indigo-600">{filtered}</span> / <span className="font-semibold text-indigo-600">{total}</span>
        </p>
      </div>
    </div>
  );
}

export default ActivityTypeFilters;
