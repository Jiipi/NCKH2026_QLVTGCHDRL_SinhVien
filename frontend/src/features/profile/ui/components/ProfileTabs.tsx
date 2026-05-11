import React from 'react';
import type { ProfileTheme } from '../profileTheme';

export interface ProfileTabItem {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  hidden?: boolean;
}

interface ProfileTabsProps {
  tabs: ProfileTabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: ProfileTheme;
}

export default function ProfileTabs({ tabs, activeTab, onTabChange, theme }: ProfileTabsProps) {
  const visibleTabs = tabs.filter(tab => !tab.hidden);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
      <div className="grid gap-2 md:grid-cols-3">
        {visibleTabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200 ${active ? theme.tabActive : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span className="min-w-0">
                <span className="block text-sm font-black">{tab.label}</span>
                {tab.description && <span className={`mt-0.5 block truncate text-xs font-semibold ${active ? 'text-white/80' : 'text-gray-400'}`}>{tab.description}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
