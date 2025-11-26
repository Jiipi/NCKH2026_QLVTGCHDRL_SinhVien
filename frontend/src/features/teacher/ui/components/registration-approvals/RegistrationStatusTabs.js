import React from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  RefreshCw,
  ListChecks
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ duyệt',
    icon: Clock,
    gradient: 'from-yellow-500 to-orange-500'
  },
  approved: {
    label: 'Đã duyệt',
    icon: CheckCircle,
    gradient: 'from-green-500 to-emerald-500'
  },
  joined: {
    label: 'Đã tham gia',
    icon: Trophy,
    gradient: 'from-blue-600 to-indigo-600'
  },
  rejected: {
    label: 'Bị từ chối',
    icon: XCircle,
    gradient: 'from-rose-500 to-red-600'
  }
};

export default function RegistrationStatusTabs({
  currentStatus,
  onStatusChange,
  statusViewMode,
  onStatusViewModeChange,
  stats
}) {
  const counts = {
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    joined: stats?.joined || 0,
    rejected: stats?.rejected || 0
  };

  const cycleMode = () => {
    switch (statusViewMode) {
      case 'pills':
        onStatusViewModeChange?.('dropdown');
        break;
      case 'dropdown':
        onStatusViewModeChange?.('compact');
        break;
      default:
        onStatusViewModeChange?.('pills');
    }
  };

  if (statusViewMode === 'dropdown') {
    const CurrentIcon =
      STATUS_CONFIG[currentStatus]?.icon || STATUS_CONFIG.pending.icon;
    const badge = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-indigo-600" />
            Trạng thái đăng ký
          </h3>
          <button
            onClick={cycleMode}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors"
            title="Đổi chế độ hiển thị"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-semibold text-sm"
          >
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label} ({counts[key] || 0})
              </option>
            ))}
          </select>
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold bg-gradient-to-r ${badge.gradient}`}
          >
            <CurrentIcon className="h-4 w-4" />
            {counts[currentStatus] || 0}
          </div>
        </div>
      </div>
    );
  }

  if (statusViewMode === 'compact') {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-indigo-600" />
            Trạng thái
          </h3>
          <button
            onClick={cycleMode}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors"
            title="Đổi chế độ hiển thị"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => onStatusChange?.(key)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentStatus === key
                    ? 'bg-indigo-50 text-indigo-600 shadow border border-indigo-200'
                    : 'text-gray-500 hover:text-indigo-600'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    currentStatus === key ? 'text-indigo-600' : 'text-gray-400'
                  }`}
                />
                <span className="text-xs font-bold">{counts[key] || 0}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Pills mode
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-indigo-600" />
            Trạng thái
          </h3>
        </div>
        <button
          onClick={cycleMode}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors"
          title="Đổi chế độ hiển thị"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => onStatusChange?.(key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                currentStatus === key
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {config.label}
              {counts[key] > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    currentStatus === key ? 'bg-white/20' : 'bg-white text-gray-600'
                  }`}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


