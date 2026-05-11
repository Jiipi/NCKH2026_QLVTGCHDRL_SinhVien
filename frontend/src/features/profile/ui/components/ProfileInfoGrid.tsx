import React from 'react';
import type { ProfileTheme } from '../profileTheme';

export interface ProfileInfoItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  helper?: React.ReactNode;
  hidden?: boolean;
  emptyText?: string;
}

interface ProfileInfoGridProps {
  title?: string;
  description?: string;
  items: ProfileInfoItem[];
  theme: ProfileTheme;
  columns?: 1 | 2 | 3;
}

export default function ProfileInfoGrid({ title, description, items, theme, columns = 2 }: ProfileInfoGridProps) {
  const visibleItems = items.filter(item => !item.hidden);
  const columnClass = columns === 3 ? 'lg:grid-cols-3' : columns === 1 ? 'lg:grid-cols-1' : 'lg:grid-cols-2';

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md md:p-6">
      {(title || description) && (
        <div className="mb-5">
          {title && <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>}
          {description && <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      )}
      <div className={`grid gap-4 md:grid-cols-2 ${columnClass}`}>
        {visibleItems.map((item) => (
          <div key={item.label} className="group rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
            <div className="flex items-start gap-3">
              {item.icon && (
                <div className={`rounded-2xl border p-2.5 ${theme.accentBg} ${theme.accentText} ${theme.accentBorder}`}>
                  {item.icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{item.label}</div>
                <div className="mt-1 break-words text-sm font-bold text-slate-900 dark:text-slate-100">{item.value || item.emptyText || '—'}</div>
                {item.helper && <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.helper}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
