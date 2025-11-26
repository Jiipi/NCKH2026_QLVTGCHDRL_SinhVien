import React, { useState } from 'react';
import {
  Clock, CheckCircle, XCircle, Trophy, Sparkles, RefreshCw
} from 'lucide-react';

const tabsConfig = [
  { key: 'pending', title: 'Chờ duyệt', icon: Clock, gradient: 'from-amber-500 to-orange-600' },
  { key: 'approved', title: 'Đã duyệt', icon: CheckCircle, gradient: 'from-emerald-500 to-green-600' },
  { key: 'joined', title: 'Đã tham gia', icon: Trophy, gradient: 'from-blue-500 to-indigo-600' },
  { key: 'rejected', title: 'Bị từ chối', icon: XCircle, gradient: 'from-rose-500 to-red-600' }
];

export function RegistrationStatusTabs({ activeTab, onTabChange, counts }) {
  const [viewMode, setViewMode] = useState('pills'); // 'pills' | 'dropdown' | 'compact'

  // Pills Mode (Default)
  const renderPills = () => (
    <div className="flex flex-wrap items-center gap-2">
      {tabsConfig.map(config => (
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
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px] text-center ${
            activeTab === config.key ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {counts[config.key] || 0}
          </span>
        </button>
      ))}
    </div>
  );

  // Dropdown Mode
  const renderDropdown = () => (
    <div className="flex items-center gap-3">
      <select
        value={activeTab}
        onChange={e => onTabChange(e.target.value)}
        className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
      >
        {tabsConfig.map(config => (
          <option key={config.key} value={config.key}>
            {config.title} ({counts[config.key] || 0})
          </option>
        ))}
      </select>
      {(() => {
        const currentConfig = tabsConfig.find(c => c.key === activeTab);
        const CurrentIcon = currentConfig?.icon || Clock;
        return (
          <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${currentConfig?.gradient || 'from-gray-400 to-gray-500'} text-white rounded-xl shadow-md`}>
            <CurrentIcon className="h-4 w-4" />
            <span className="font-bold text-sm">{counts[activeTab] || 0}</span>
          </div>
        );
      })()}
    </div>
  );

  // Compact Mode
  const renderCompact = () => (
    <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
      {tabsConfig.map(config => {
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
            <span className={`text-xs font-bold ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
              {counts[config.key] || 0}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderView = () => {
    switch (viewMode) {
      case 'dropdown':
        return renderDropdown();
      case 'compact':
        return renderCompact();
      default:
        return renderPills();
    }
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
      <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <h3 className="text-base font-bold text-gray-900">Trạng thái</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'pills' ? 'dropdown' : viewMode === 'dropdown' ? 'compact' : 'pills')}
              className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
              title="Chuyển chế độ hiển thị"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {renderView()}
      </div>
    </div>
  );
}
