import React from 'react';
import { Sparkles, RefreshCw, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';

export default function ActivityApprovalStatusTabs({
  viewMode,
  statusViewMode,
  stats,
  onViewModeChange,
  onStatusViewModeChange
}) {
  const safeStats = {
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    rejected: stats?.rejected || 0
  };

  return (
    <div className="relative group mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
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
          <div className="flex flex-wrap gap-2">
            <StatusButton
              active={viewMode === 'pending'}
              colorClass="from-yellow-500 to-orange-500"
              icon={Clock}
              label="Chờ duyệt"
              count={safeStats.pending}
              onClick={() => onViewModeChange?.('pending')}
            />
            <StatusButton
              active={viewMode === 'approved'}
              colorClass="from-green-500 to-emerald-500"
              icon={CheckCircle}
              label="Đã duyệt"
              count={safeStats.approved}
              onClick={() => onViewModeChange?.('approved')}
            />
            <StatusButton
              active={viewMode === 'rejected'}
              colorClass="from-red-500 to-rose-500"
              icon={XCircle}
              label="Từ chối"
              count={safeStats.rejected}
              onClick={() => onViewModeChange?.('rejected')}
            />
          </div>
        )}

        {statusViewMode === 'dropdown' && (
          <div className="flex items-center gap-3">
            <select
              value={viewMode}
              onChange={(e) => onViewModeChange?.(e.target.value)}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
            >
              <option value="pending">Chờ duyệt ({safeStats.pending})</option>
              <option value="approved">Đã duyệt ({safeStats.approved})</option>
              <option value="rejected">Từ chối ({safeStats.rejected})</option>
            </select>
            {(() => {
              const configs = {
                pending: { icon: Clock, gradient: 'from-yellow-500 to-orange-500', count: safeStats.pending },
                approved: { icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', count: safeStats.approved },
                rejected: { icon: XCircle, gradient: 'from-red-500 to-rose-500', count: safeStats.rejected }
              };
              const current = configs[viewMode] || configs.pending;
              const CurrentIcon = current.icon || Filter;
              return (
                <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${current.gradient} text-white rounded-xl shadow-md`}>
                  <CurrentIcon className="h-4 w-4" />
                  <span className="font-bold text-sm">{current.count}</span>
                </div>
              );
            })()}
          </div>
        )}

        {statusViewMode === 'compact' && (
          <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
            <CompactStatus
              icon={Clock}
              active={viewMode === 'pending'}
              value={safeStats.pending}
              onClick={() => onViewModeChange?.('pending')}
            />
            <CompactStatus
              icon={CheckCircle}
              active={viewMode === 'approved'}
              value={safeStats.approved}
              onClick={() => onViewModeChange?.('approved')}
            />
            <CompactStatus
              icon={XCircle}
              active={viewMode === 'rejected'}
              value={safeStats.rejected}
              onClick={() => onViewModeChange?.('rejected')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatusButton({ active, colorClass, icon: Icon, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
        active ? `bg-gradient-to-r ${colorClass} text-white shadow-lg` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {count > 0 && (
        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{count}</span>
      )}
    </button>
  );
}

function CompactStatus({ icon: Icon, active, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
        active ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
      <span className={`text-xs font-bold ${active ? 'text-purple-600' : 'text-gray-600'}`}>{value}</span>
    </button>
  );
}


