import React from 'react';
import { Sparkles, RefreshCw, AlertCircle, Clock } from 'lucide-react';

export default function MyActivitiesStatusTabs({
  tabs = [],
  activeTab,
  onTabChange,
  statusViewMode,
  onStatusViewModeChange,
  showQrHint
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
      <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <h3 className="text-base font-bold text-gray-900">Trạng thái</h3>
          </div>
          <button
            onClick={onStatusViewModeChange}
            className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
            title="Chuyển chế độ hiển thị"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {statusViewMode === 'pills' && (
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((config) => (
              <button
                key={config.key}
                onClick={() => onTabChange(config.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === config.key
                    ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-purple-300'
                }`}
              >
                <config.icon className="h-4 w-4" />
                <span className="text-sm">{config.title}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px] text-center ${
                    activeTab === config.key ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {config.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {statusViewMode === 'dropdown' && (
          <div className="flex items-center gap-3">
            <select
              value={activeTab}
              onChange={(e) => onTabChange(e.target.value)}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
            >
              {tabs.map((config) => (
                <option key={config.key} value={config.key}>
                  {config.title} ({config.count})
                </option>
              ))}
            </select>
            {(() => {
              const currentConfig = tabs.find((c) => c.key === activeTab);
              const CurrentIcon = currentConfig?.icon || Clock;
              return (
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${
                    currentConfig?.gradient || 'from-gray-400 to-gray-500'
                  } text-white rounded-xl shadow-md`}
                >
                  <CurrentIcon className="h-4 w-4" />
                  <span className="font-bold text-sm">{currentConfig?.count || 0}</span>
                </div>
              );
            })()}
          </div>
        )}

        {statusViewMode === 'compact' && (
          <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
            {tabs.map((config) => {
              const isActive = activeTab === config.key;
              return (
                <button
                  key={config.key}
                  onClick={() => onTabChange(config.key)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                  }`}
                  title={config.title}
                >
                  <config.icon className={`h-5 w-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                  <span className={`text-xs font-bold ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>{config.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {showQrHint && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-xs text-blue-700">
              <strong>Mẹo:</strong> Click "QR" để lấy mã điểm danh
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

