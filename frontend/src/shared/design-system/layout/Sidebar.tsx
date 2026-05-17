/**
 * Design System — Sidebar Navigation Component
 *
 * @module design-system/layout
 */

import React, { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, LogOut, User } from 'lucide-react';

/* ============================================================
   Types
   ============================================================ */

export interface NavItem {
  id?:        string;
  label:     string;
  icon?:     ReactNode;
  path?:     string;
  badge?:    string | number;
  badgeColor?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  children?: NavItem[];
}

interface SidebarProps {
  items:         NavItem[];
  logo?:        ReactNode;
  user?:        { name?: string; email?: string; avatar?: string };
  isCollapsed?: boolean;
  onToggle?:    () => void;
  onLogout?:   () => void;
  className?:   string;
  activeColor?: string;
}

/* ============================================================
   Helper
   ============================================================ */

function hasActiveChild(items: NavItem[], pathname: string): boolean {
  return items.some(item => {
    if (item.path && pathname.startsWith(item.path) && item.path !== '/') return true;
    if (item.children) return hasActiveChild(item.children, pathname);
    return false;
  });
}

/* ============================================================
   Nav Item Component
   ============================================================ */

interface NavItemProps {
  item:       NavItem;
  collapsed:  boolean;
  depth?:    number;
  activeColor?: string;
}

function NavItemComponent({ item, collapsed, depth = 0, activeColor }: NavItemProps) {
  const location   = useLocation();
  const [open, setOpen] = useState(() =>
    item.children ? hasActiveChild(item.children, location.pathname) : false
  );

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path ? location.pathname.startsWith(item.path) && item.path !== '/' ? location.pathname === item.path : location.pathname.startsWith(item.path) : false;
  const isChildActive = item.children ? hasActiveChild(item.children, location.pathname) : false;

  const activeStyle = activeColor
    ? { backgroundColor: activeColor, color: 'white', borderLeftColor: 'white' }
    : {
        backgroundColor: 'var(--primary-50, #eff6ff)',
        color: 'var(--primary-700, #1d4ed8)',
        borderLeftColor: 'var(--primary-500, #3b82f6)',
      };

  const badgeColorMap: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    danger:  'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info:    'bg-sky-100 text-sky-700',
  };

  const badgeBase = 'text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center';

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-sm font-medium',
            'transition-all duration-150',
            'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            depth > 0 ? 'ml-4' : '',
          ].join(' ')}
          title={collapsed ? item.label : undefined}
        >
          {item.icon && (
            <span className="shrink-0 w-5 h-5 flex items-center justify-center">
              {item.icon}
            </span>
          )}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {open ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
            </>
          )}
        </button>

        {!collapsed && open && (
          <div className="mt-1 space-y-0.5">
            {item.children!.map(child => (
              <NavItemComponent
                key={child.id || child.label}
                item={child}
                collapsed={collapsed}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.path) {
    return (
      <NavLink
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={[
          'flex items-center gap-3 px-3 py-2.5 rounded-xl',
          'text-sm font-medium',
          'transition-all duration-150',
          'relative',
          depth > 0 ? 'ml-4' : '',
          isActive || isChildActive
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
          // Active indicator bar
          isActive || isChildActive
            ? 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:rounded-r-full before:bg-primary-500'
            : '',
        ].join(' ')}
      >
        {item.icon && (
          <span className="shrink-0 w-5 h-5 flex items-center justify-center">
            {item.icon}
          </span>
        )}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && (
              <span className={['shrink-0', badgeBase, badgeColorMap[item.badgeColor || 'primary']].join(' ')}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  }

  return (
    <button
      title={collapsed ? item.label : undefined}
      className={[
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
        'text-sm font-medium',
        'transition-all duration-150',
        depth > 0 ? 'ml-4' : '',
        'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      ].join(' ')}
    >
      {item.icon && (
        <span className="shrink-0 w-5 h-5 flex items-center justify-center">
          {item.icon}
        </span>
      )}
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
    </button>
  );
}

/* ============================================================
   Sidebar Component
   ============================================================ */

export function Sidebar({
  items,
  logo,
  user,
  isCollapsed = false,
  onToggle,
  onLogout,
  className = '',
}: SidebarProps) {
  return (
    <aside
      className={[
        'flex flex-col h-screen',
        'bg-white dark:bg-slate-900',
        'border-r border-slate-200 dark:border-slate-700',
        'transition-all duration-300 ease-in-out',
        'relative z-30',
        isCollapsed ? 'w-[72px]' : 'w-[280px]',
        className,
      ].join(' ')}
    >
      {/* Logo / Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-slate-700 shrink-0">
        {logo || (
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        )}
        {!isCollapsed && (
          <span className="text-base font-bold text-slate-900 dark:text-white truncate">
            Quản lý HD
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-1">
        {items.map(item => (
          <NavItemComponent
            key={item.id || item.label}
            item={item}
            collapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-700">
          <div className={[
            'flex items-center gap-3 px-3 py-3',
            isCollapsed ? 'justify-center' : '',
          ].join(' ')}>
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-slate-500" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className={[
                'w-full flex items-center gap-3 px-3 py-2.5 mb-2',
                'text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
                'rounded-xl transition-colors duration-150',
                isCollapsed ? 'justify-center' : '',
              ].join(' ')}
              title="Đăng xuất"
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Đăng xuất</span>}
            </button>
          )}
        </div>
      )}

      {/* Toggle button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 z-40
            w-6 h-6 rounded-full
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            shadow-sm
            flex items-center justify-center
            text-slate-400 hover:text-slate-600 dark:hover:text-slate-200
            transition-colors duration-150"
        >
          {isCollapsed ? '›' : '‹'}
        </button>
      )}
    </aside>
  );
}

/* ============================================================
   Sidebar Group
   ============================================================ */

interface NavGroupProps {
  label?:    string;
  children:  ReactNode;
  collapsed?: boolean;
}

export function NavGroup({ label, children, collapsed }: NavGroupProps) {
  return (
    <div className="space-y-1">
      {!collapsed && label && (
        <p className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}
