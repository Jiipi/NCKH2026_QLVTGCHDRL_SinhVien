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
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-indigo-400/20 to-teal-400/20 blur opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      <div className="relative rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">Trạng thái</h3>
          </div>
          <button
            onClick={onStatusViewModeChange}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/60 hover:text-indigo-600 dark:hover:bg-white/10 dark:hover:text-indigo-300"
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
                className={`relative flex items-center gap-2 rounded-2xl border px-4 py-2 font-bold transition-all duration-200 ${
                  activeTab === config.key
                    ? 'border-indigo-200/70 bg-indigo-50/80 text-indigo-700 shadow-sm dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300'
                    : 'border-white/60 bg-white/40 text-slate-600 hover:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <config.icon className="h-4 w-4" />
                <span className="text-sm">{config.title}</span>
                <span className={`min-w-[24px] rounded-full px-2 py-0.5 text-center text-xs font-black ${activeTab === config.key ? 'bg-white/65 text-indigo-700 dark:bg-white/10 dark:text-indigo-200' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>
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
              className="flex-1 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none"
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
                <div className="flex items-center gap-2 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 px-4 py-2.5 text-indigo-700 shadow-sm dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
                  <CurrentIcon className="h-4 w-4" />
                  <span className="text-sm font-black">{currentConfig?.count || 0}</span>
                </div>
              );
            })()}
          </div>
        )}

        {statusViewMode === 'compact' && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/40 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            {tabs.map((config) => {
              const isActive = activeTab === config.key;
              return (
                <button
                  key={config.key}
                  onClick={() => onTabChange(config.key)}
                  className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 ${
                    isActive ? 'bg-white/80 text-indigo-700 shadow-sm scale-105 dark:bg-white/15 dark:text-indigo-300' : 'text-slate-500 hover:bg-white/45 dark:text-slate-400 dark:hover:bg-white/10'
                  }`}
                  title={config.title}
                >
                  <config.icon className="h-5 w-5" />
                  <span className="text-xs font-black">{config.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {showQrHint && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-blue-200/70 bg-blue-50/70 px-3 py-2 dark:border-blue-400/20 dark:bg-blue-400/10">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-300" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-200">
              <strong>Mẹo:</strong> Click "QR" để lấy mã điểm danh
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
