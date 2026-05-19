import React from 'react';

/**
 * ResponsiveTable - Wrapper for tables to handle mobile overflow
 * 
 * Usage:
 * <ResponsiveTable>
 *   <table>...</table>
 * </ResponsiveTable>
 */

export default function ResponsiveTable({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * ResponsiveCard - Card component that stacks properly on mobile
 */
export function ResponsiveCard({ title, children, className = '', actions }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {actions && (
            <div className="flex items-center gap-2 flex-wrap">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        {children}
      </div>
    </div>
  );
}

/**
 * ResponsiveGrid - Grid that adjusts columns based on screen size
 *
 * Uses static class maps so Tailwind's content scanner can preserve the classes
 * during production purge (interpolation like `grid-cols-${cols.mobile}` would be stripped).
 */
const COL_MOBILE: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4',
  5: 'grid-cols-5', 6: 'grid-cols-6'
};
const COL_TABLET: Record<number, string> = {
  1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6'
};
const COL_DESKTOP: Record<number, string> = {
  1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6'
};
const GAP_MAP: Record<number, string> = {
  1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 5: 'gap-5', 6: 'gap-6', 8: 'gap-8'
};
const STACK_GAP_MAP = GAP_MAP;

export function ResponsiveGrid({ children, cols = { mobile: 1, tablet: 2, desktop: 3 }, gap = 4, className = '' }) {
  const m = COL_MOBILE[cols.mobile] || COL_MOBILE[1];
  const t = COL_TABLET[cols.tablet] || COL_TABLET[2];
  const d = COL_DESKTOP[cols.desktop] || COL_DESKTOP[3];
  const g = GAP_MAP[gap] || GAP_MAP[4];
  return (
    <div className={`grid ${m} ${t} ${d} ${g} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * ResponsiveStack - Flexbox that stacks on mobile
 */
export function ResponsiveStack({ children, direction = 'row', gap = 4, className = '' }) {
  const dirClass = direction === 'row' ? 'sm:flex-row' : 'sm:flex-col';
  const g = STACK_GAP_MAP[gap] || STACK_GAP_MAP[4];
  return (
    <div className={`flex flex-col ${dirClass} ${g} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * MobileShow - Only show content on mobile
 */
export function MobileShow({ children }) {
  return (
    <div className="block md:hidden">
      {children}
    </div>
  );
}

/**
 * MobileHide - Hide content on mobile
 */
export function MobileHide({ children }) {
  return (
    <div className="hidden md:block">
      {children}
    </div>
  );
}

/**
 * ResponsiveButton - Button with responsive padding and text
 */
export function ResponsiveButton({ children, icon, className = '', ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        px-3 sm:px-4 py-2 sm:py-2.5
        text-sm font-medium
        rounded-lg
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="hidden sm:inline">{children}</span>
      {/* On mobile, show only icon if icon is provided */}
      {icon && <span className="sm:hidden sr-only">{children}</span>}
    </button>
  );
}
