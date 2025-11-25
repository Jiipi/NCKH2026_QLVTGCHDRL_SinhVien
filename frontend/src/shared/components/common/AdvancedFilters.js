import React from 'react';
import { Filter, SlidersHorizontal, X, RefreshCw } from 'lucide-react';

/**
 * AdvancedFilters - Expandable advanced filters panel
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the panel is open
 * @param {Function} props.onToggle - Toggle open/close
 * @param {number} props.activeCount - Number of active filters
 * @param {Function} props.onClear - Clear all filters
 * @param {React.ReactNode} props.children - Filter content
 * @param {string} props.title - Panel title (default: 'Bộ lọc nâng cao')
 * @param {string} props.className - Additional CSS classes
 */
export default function AdvancedFilters({
  isOpen = false,
  onToggle,
  activeCount = 0,
  onClear,
  children,
  title = 'Bộ lọc nâng cao',
  className = ''
}) {
  return (
    <div className={className}>
      {/* Toggle Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm">Lọc nâng cao</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full min-w-[20px] text-center">
              {activeCount}
            </span>
          )}
          <span className={`text-xs transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {/* Clear filters button */}
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium border-2 border-red-200 hover:border-red-300"
            title="Xóa tất cả bộ lọc"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">Xóa lọc</span>
          </button>
        )}
      </div>

      {/* Expandable Panel */}
      {isOpen && (
        <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              {title}
            </h3>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {children}
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * FilterField - Individual filter field wrapper
 */
export function FilterField({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * FilterInput - Styled filter input
 */
export function FilterInput({ type = 'text', ...props }) {
  return (
    <input
      type={type}
      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
      {...props}
    />
  );
}

/**
 * FilterSelect - Styled filter select
 */
export function FilterSelect({ options = [], ...props }) {
  return (
    <select
      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
