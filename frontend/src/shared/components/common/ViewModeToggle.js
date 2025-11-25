import React from 'react';
import { Grid3X3, List } from 'lucide-react';

/**
 * ViewModeToggle - Toggle between Grid and List view modes
 * 
 * @param {Object} props
 * @param {'grid'|'list'} props.viewMode - Current view mode
 * @param {Function} props.onViewModeChange - Callback when view mode changes
 * @param {boolean} props.showLabels - Whether to show text labels (default: true on larger screens)
 * @param {string} props.className - Additional CSS classes
 */
export default function ViewModeToggle({
  viewMode = 'grid',
  onViewModeChange,
  showLabels = true,
  className = ''
}) {
  return (
    <div className={`flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200 ${className}`}>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
          viewMode === 'grid'
            ? 'bg-white shadow-md text-indigo-600 border border-indigo-200'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="Hiển thị dạng lưới"
        aria-pressed={viewMode === 'grid'}
      >
        <Grid3X3 className="h-4 w-4" />
        {showLabels && <span className="hidden sm:inline">Lưới</span>}
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
          viewMode === 'list'
            ? 'bg-white shadow-md text-indigo-600 border border-indigo-200'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="Hiển thị dạng danh sách"
        aria-pressed={viewMode === 'list'}
      >
        <List className="h-4 w-4" />
        {showLabels && <span className="hidden sm:inline">Danh sách</span>}
      </button>
    </div>
  );
}
