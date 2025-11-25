import React from 'react';
import { Clock, CheckCircle, XCircle, Filter, RefreshCw, Sparkles, Trophy } from 'lucide-react';

/**
 * StatusFilter - Reusable status filter component with multiple view modes
 * 
 * @param {Object} props
 * @param {string} props.value - Current selected status value
 * @param {Function} props.onChange - Callback when status changes
 * @param {Array} props.options - Status options array [{value, label, count, icon, gradient}]
 * @param {'pills'|'dropdown'|'compact'} props.viewMode - Display mode
 * @param {Function} props.onViewModeToggle - Callback to toggle view mode
 * @param {string} props.title - Section title (default: 'Trạng thái')
 * @param {string} props.className - Additional CSS classes
 */
export default function StatusFilter({
  value = '',
  onChange,
  options = [],
  viewMode = 'pills',
  onViewModeToggle,
  title = 'Trạng thái',
  className = ''
}) {
  // Default options if not provided
  const defaultOptions = [
    { value: '', label: 'Tất cả', icon: Filter, gradient: 'from-indigo-500 to-purple-600' },
    { value: 'cho_duyet', label: 'Chờ duyệt', icon: Clock, gradient: 'from-yellow-500 to-orange-500' },
    { value: 'da_duyet', label: 'Đã duyệt', icon: CheckCircle, gradient: 'from-green-500 to-emerald-500' },
    { value: 'tu_choi', label: 'Từ chối', icon: XCircle, gradient: 'from-red-500 to-rose-500' }
  ];

  const statusOptions = options.length > 0 ? options : defaultOptions;
  const currentOption = statusOptions.find(opt => opt.value === value) || statusOptions[0];
  const CurrentIcon = currentOption?.icon || Filter;

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
      <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
          </div>
          {onViewModeToggle && (
            <button
              onClick={onViewModeToggle}
              className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
              title="Chuyển chế độ hiển thị"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Pills View */}
        {viewMode === 'pills' && (
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => {
              const Icon = option.icon || Filter;
              const isActive = value === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => onChange(option.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                  {option.count !== undefined && option.count > 0 && (
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {option.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Dropdown View */}
        {viewMode === 'dropdown' && (
          <div className="flex items-center gap-3">
            <select
              value={value}
              onChange={e => onChange(e.target.value)}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                </option>
              ))}
            </select>
            <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${currentOption?.gradient || 'from-gray-400 to-gray-500'} text-white rounded-xl shadow-md`}>
              <CurrentIcon className="h-4 w-4" />
              <span className="font-bold text-sm">{currentOption?.count || 0}</span>
            </div>
          </div>
        )}

        {/* Compact View */}
        {viewMode === 'compact' && (
          <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
            {statusOptions.map(option => {
              const Icon = option.icon || Filter;
              const isActive = value === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => onChange(option.value)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                  }`}
                  title={option.label}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                  <span className={`text-xs font-bold ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
                    {option.count !== undefined ? option.count : ''}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
