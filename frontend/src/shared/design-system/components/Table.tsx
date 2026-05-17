/**
 * Design System — Table Component
 *
 * @module design-system/components
 */

import React, { type HTMLAttributes, type ReactNode } from 'react';

/* ============================================================
   Table Container
   ============================================================ */

interface TableProps extends HTMLAttributes<HTMLDivElement> {
  children:     ReactNode;
  variant?:    'default' | 'bordered' | 'striped' | 'clean';
  size?:       'sm' | 'md' | 'lg';
  hoverable?:  boolean;
}

const tableVariants: Record<string, string> = {
  default:  '',
  bordered: 'border border-border-default',
  striped:  '',
  clean:    '',
};

const tableSizes: Record<string, { wrapper: string; row: string; header: string; cell: string }> = {
  sm: {
    wrapper: 'text-xs',
    row:    'px-3 py-2',
    header: 'px-3 py-2',
    cell:   'px-3 py-2',
  },
  md: {
    wrapper: 'text-sm',
    row:    'px-4 py-3',
    header: 'px-4 py-3',
    cell:   'px-4 py-3',
  },
  lg: {
    wrapper: 'text-base',
    row:    'px-6 py-4',
    header: 'px-6 py-4',
    cell:   'px-6 py-4',
  },
};

export function TableContainer({
  children,
  variant    = 'default',
  size       = 'md',
  hoverable  = true,
  className  = '',
  ...props
}: TableProps) {
  return (
    <div
      {...props}
      className={[
        'w-full overflow-x-auto rounded-xl',
        'bg-surface-card border border-border-default',
        'dark:bg-slate-800 dark:border-slate-700',
        tableVariants[variant],
        className,
      ].join(' ')}
      {...props}
    >
      <table className={['w-full', tableSizes[size].wrapper].join(' ')}>
        {children}
      </table>
    </div>
  );
}

/* ============================================================
   Table Head
   ============================================================ */

interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  sticky?: boolean;
}

export function TableHead({ children, sticky = false, className = '', ...props }: TableHeadProps) {
  return (
    <thead
      className={[
        'bg-surface-muted dark:bg-slate-800/50',
        sticky ? 'sticky top-0 z-10' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </thead>
  );
}

/* ============================================================
   Table Body
   ============================================================ */

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children:   ReactNode;
  striped?:   boolean;
}

export function TableBody({ children, striped = true, className = '', ...props }: TableBodyProps) {
  return (
    <tbody
      className={['divide-y divide-border-default dark:divide-slate-700', className].join(' ')}
      {...props}
    >
      {React.Children.map(children, (row, i) => {
        if (!React.isValidElement(row)) return row;
        const isOdd = i % 2 !== 0;
        return React.cloneElement(row as React.ReactElement<{ className?: string }>, {
          className: [
            (row as React.ReactElement<{ className?: string }>).props.className || '',
            striped && isOdd ? 'bg-slate-50/50 dark:bg-slate-800/30' : '',
          ].filter(Boolean).join(' '),
        });
      })}
    </tbody>
  );
}

/* ============================================================
   Table Row
   ============================================================ */

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children:      ReactNode;
  hoverable?:   boolean;
  selected?:    boolean;
  onClick?:     () => void;
}

export function TableRow({
  children,
  hoverable  = true,
  selected   = false,
  onClick,
  className  = '',
  ...props
}: TableRowProps) {
  return (
    <tr
      className={[
        hoverable ? 'transition-colors duration-100 hover:bg-surface-muted/50 dark:hover:bg-slate-700/30' : '',
        selected ? 'bg-primary-50 dark:bg-primary-900/20' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
}

/* ============================================================
   Table Header Cell
   ============================================================ */

interface TableThProps extends HTMLAttributes<HTMLTableCellElement> {
  children:   ReactNode;
  sortable?: boolean;
  align?:    'left' | 'center' | 'right';
  width?:    string;
}

export function TableTh({
  children,
  sortable,
  align      = 'left',
  width,
  className  = '',
  ...props
}: TableThProps) {
  const alignClass = {
    left:   'text-left',
    center: 'text-center',
    right:  'text-right',
  }[align];

  return (
    <th
      className={[
        'font-semibold text-text-secondary dark:text-slate-400',
        'uppercase tracking-wider text-[11px]',
        'whitespace-nowrap',
        'border-b border-border-default dark:border-slate-700',
        alignClass,
        className,
      ].filter(Boolean).join(' ')}
      style={width ? { ...(props.style || {}), width } : props.style}
    >
      <div className={['inline-flex items-center gap-1', align === 'right' ? 'flex-row-reverse' : ''].join(' ')}>
        {children}
        {sortable && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="opacity-40">
            <path d="M6 3L9 7H3L6 3Z" />
          </svg>
        )}
      </div>
    </th>
  );
}

/* ============================================================
   Table Data Cell
   ============================================================ */

interface TableTdProps extends HTMLAttributes<HTMLTableCellElement> {
  children:  ReactNode;
  align?:   'left' | 'center' | 'right';
  muted?:   boolean;
}

export function TableTd({
  children,
  align     = 'left',
  muted     = false,
  className = '',
  ...props
}: TableTdProps) {
  const alignClass = {
    left:   'text-left',
    center: 'text-center',
    right:  'text-right',
  }[align];

  return (
    <td
      className={[
        'text-text-primary dark:text-slate-200',
        muted ? 'text-text-muted' : '',
        alignClass,
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </td>
  );
}

/* ============================================================
   Empty State
   ============================================================ */

interface TableEmptyProps {
  colSpan?:  number;
  message?:  string;
  icon?:     ReactNode;
}

export function TableEmpty({
  colSpan  = 5,
  message  = 'Không có dữ liệu',
  icon,
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-12 text-text-muted">
        <div className="flex flex-col items-center gap-3">
          {icon || (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
          <p className="text-sm font-medium">{message}</p>
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   Pagination
   ============================================================ */

interface PaginationProps {
  currentPage:  number;
  totalPages:   number;
  onPageChange: (page: number) => void;
  siblings?:    number;
  className?:   string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblings  = 1,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);

  const getPages = () => {
    const total = totalPages;
    const curr  = currentPage;
    const sibs  = siblings;

    const left  = Math.max(2, curr - sibs);
    const right = Math.min(total - 1, curr + sibs);

    const pages: (number | '...')[] = [1];
    if (left > 2)  pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push('...');
    pages.push(total);

    return pages;
  };

  const pages = getPages();

  return (
    <div className={['flex items-center justify-center gap-1', className].join(' ')}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium
          text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors duration-150"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-text-muted">
            •••
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={[
              'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium',
              'transition-colors duration-150',
              p === currentPage
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-text-secondary hover:bg-surface-muted',
            ].join(' ')}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium
          text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors duration-150"
      >
        ›
      </button>
    </div>
  );
}
