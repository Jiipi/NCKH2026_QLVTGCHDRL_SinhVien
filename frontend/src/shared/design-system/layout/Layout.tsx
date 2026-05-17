/**
 * Design System — Page Layout Component
 *
 * @module design-system/layout
 */

import React, { type ReactNode } from 'react';
import { Sidebar, NavItem, type NavItem as NavItemType } from './Sidebar';

/* ============================================================
   Page Layout (with sidebar + content)
   ============================================================ */

interface PageLayoutProps {
  children:      ReactNode;
  sidebar?:     ReactNode;
  header?:      ReactNode;
  footer?:      ReactNode;
  className?:   string;
  contentClassName?: string;
  sidebarWidth?: number;
  maxWidth?:   boolean;
}

export function PageLayout({
  children,
  sidebar,
  header,
  footer,
  className     = '',
  contentClassName = '',
  sidebarWidth = 280,
  maxWidth     = true,
}: PageLayoutProps) {
  return (
    <div className={['min-h-screen flex bg-surface-page dark:bg-slate-900', className].join(' ')}>
      {sidebar && <div className="shrink-0">{sidebar}</div>}
      <div className="flex-1 flex flex-col min-w-0">
        {header && <div className="shrink-0">{header}</div>}
        <main
          className={[
            'flex-1 overflow-auto',
            'p-6',
            maxWidth ? 'max-w-[1440px] w-full mx-auto' : '',
            contentClassName,
          ].join(' ')}
        >
          {children}
        </main>
        {footer && <div className="shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

/* ============================================================
   Section (nội dung có thể tái sử dụng)
   ============================================================ */

interface SectionProps {
  children:   ReactNode;
  className?: string;
}

export function Section({ children, className = '' }: SectionProps) {
  return (
    <section className={['mb-8', className].join(' ')}>
      {children}
    </section>
  );
}

/* ============================================================
   Grid Layouts
   ============================================================ */

interface GridProps {
  children:   ReactNode;
  cols?:     1 | 2 | 3 | 4 | 5 | 6;
  gap?:      'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const gridCols: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
};

const gridGap: Record<string, string> = {
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-10',
};

export function Grid({ children, cols = 3, gap = 'md', className = '' }: GridProps) {
  return (
    <div className={['grid', gridCols[cols], gridGap[gap], className].join(' ')}>
      {children}
    </div>
  );
}

/* ============================================================
   Stack (flex column)
   ============================================================ */

interface StackProps {
  children:   ReactNode;
  gap?:      'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?:    'start' | 'center' | 'end' | 'stretch';
  justify?:  'start' | 'center' | 'end' | 'between' | 'around';
  className?: string;
}

const stackAlign: Record<string, string> = {
  start:   'items-start',
  center:  'items-center',
  end:     'items-end',
  stretch: 'items-stretch',
};

const stackJustify: Record<string, string> = {
  start:   'justify-start',
  center:  'justify-center',
  end:     'justify-end',
  between: 'justify-between',
  around:  'justify-around',
};

export function Stack({
  children,
  gap      = 'md',
  align    = 'stretch',
  justify  = 'start',
  className = '',
}: StackProps) {
  return (
    <div className={[
      'flex flex-col',
      `gap-${gap === 'xs' ? '1' : gap === 'sm' ? '2' : gap === 'md' ? '4' : gap === 'lg' ? '6' : '8'}`,
      stackAlign[align],
      stackJustify[justify],
      className,
    ].join(' ')}>
      {children}
    </div>
  );
}

/* ============================================================
   Horizontal Stack (flex row)
   ============================================================ */

interface HStackProps {
  children:    ReactNode;
  gap?:       'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?:     'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?:   'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?:     boolean;
  className?: string;
}

export function HStack({
  children,
  gap       = 'md',
  align     = 'center',
  justify   = 'start',
  wrap      = false,
  className = '',
}: HStackProps) {
  const gapMap = { xs: 'gap-1', sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8' };
  return (
    <div className={[
      'flex',
      gapMap[gap],
      stackAlign[align],
      stackJustify[justify],
      wrap ? 'flex-wrap' : '',
      className,
    ].join(' ')}>
      {children}
    </div>
  );
}
