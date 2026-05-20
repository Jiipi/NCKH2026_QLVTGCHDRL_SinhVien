import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Bell, 
  Activity,
  CheckSquare,
  ChevronDown,
  Menu,
  Home,
  Settings,
  Shield,
  Layers,
  Package,
  ChevronsLeft,
  QrCode,
  FileText,
  ShieldAlert,
  User,
  ScanFace
} from 'lucide-react';
import '../../styles/teacher-sidebar.css';
import sessionStorageManager from '../../api/sessionStorageManager';
import SemesterFilter from '../../../widgets/semester/ui/SemesterSwitcher';
import useSemesterData, { getGlobalSemester, setGlobalSemester, useGlobalSemesterSync } from '../../hooks/useSemesterData';
import { getCurrentSemesterValue } from '../../lib/semester';

interface MenuItemProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  badge?: number | string | null;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  inDropdown?: boolean;
}

interface GroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  groupKey: string;
  icon?: React.ReactNode;
  collapsed?: boolean;
}

interface MenuItemData {
  key: string;
  to?: string;
  label?: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: number | string | null;
  type?: string;
  title?: string;
  groupKey?: string;
  defaultOpen?: boolean;
  items?: MenuItemData[];
}

function MenuItem({ to, icon, label, badge, active, onClick, collapsed, inDropdown }: MenuItemProps) {
  const content = (
    <Link
      to={to}
      className={`
        flex items-center gap-3 rounded-lg transition-all duration-200 relative group
        ${collapsed && !inDropdown ? 'justify-center p-3' : 'px-4 py-2.5'}
        ${inDropdown ? 'mx-2' : ''}
        ${active
          ? 'bg-blue-800 text-white shadow-sm dark:bg-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white'
        }
      `}
      onClick={onClick}
      title={collapsed && !inDropdown ? label : ''}
    >
      <div className={`flex items-center justify-center w-4 h-4 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}>
        {icon || <span className="w-2 h-2 rounded-full bg-current" />}
      </div>
      {(!collapsed || inDropdown) && (
        <>
          <span className="font-medium flex-1 text-sm">{label}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
      {active && !collapsed && !inDropdown && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
      )}
      {collapsed && badge && !inDropdown && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </div>
      )}
    </Link>
  );

  if (collapsed && !inDropdown) {
    return (
      <div className="relative group">
        {content}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
        </div>
      </div>
    );
  }

  return content;
}

function Group({ title, children, defaultOpen = false, groupKey, icon, collapsed }: GroupProps) {
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem(`admin-sidebar-group-${groupKey}`);
    return stored !== null ? stored === 'true' : defaultOpen;
  });
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const containerRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Close flyout on outside tap (touch devices don't fire onMouseLeave)
  useEffect(() => {
    if (!collapsed || !flyoutOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const container = containerRef.current as HTMLElement | null;
      if (container && !container.contains(e.target as Node)) {
        setFlyoutOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [collapsed, flyoutOpen]);

  const handleToggle = useCallback(() => {
    setOpen(prev => {
      const newState = !prev;
      localStorage.setItem(`admin-sidebar-group-${groupKey}`, newState.toString());
      return newState;
    });
  }, [groupKey]);

  if (collapsed) {
    return (
      <div
        className="relative group mb-2"
        ref={containerRef}
        onMouseEnter={() => { if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); } setFlyoutOpen(true); }}
        onMouseLeave={(e) => {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = setTimeout(() => {
            const container = containerRef.current;
            if (!container) { setFlyoutOpen(false); return; }
            const rect = container.getBoundingClientRect();
            const x = e.clientX; const y = e.clientY;
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
              setFlyoutOpen(false);
            }
          }, 120);
        }}
      >
        <div
          className="w-full flex items-center justify-center p-3 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 cursor-pointer"
          onClick={() => setFlyoutOpen(v => !v)}
        >
          <div className="flex items-center justify-center w-5 h-5">
            {icon}
          </div>
        </div>
        <div
          className={`absolute left-full ml-2 top-0 min-w-[220px] max-w-[260px] bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-200 z-[100] ${flyoutOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}
          onMouseEnter={() => { if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); } setFlyoutOpen(true); }}
          onMouseLeave={() => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = setTimeout(() => setFlyoutOpen(false), 150);
          }}
        >
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
          </div>
          <div className="py-2">
            {children}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
        aria-expanded={open}
      >
        <div className="flex items-center justify-center w-5 h-5">
          {icon}
        </div>
        <span className="font-semibold flex-1 text-left uppercase text-xs tracking-wider">{title}</span>
        <div className="transition-transform duration-200" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <div 
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '500px' : '0', opacity: open ? 1 : 0 }}
      >
        <div className="pl-4 mt-1 space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarSemesterPicker() {
  const [semester, setSemesterState] = useState(() => getGlobalSemester() || getCurrentSemesterValue(true));
  const { options } = useSemesterData(semester);
  useGlobalSemesterSync(semester, setSemesterState);

  const handleChange = useCallback((value) => {
    setSemesterState(value);
    setGlobalSemester(value);
  }, []);

  return (
    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
      <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Học kỳ</label>
      <SemesterFilter value={semester} onChange={handleChange} label="" options={options} />
    </div>
  );
}

function AdminStudentSidebar() {
  const location = useLocation();
  const path = location.pathname;
  const search = location.search || '';
  const isApprovalActivities = path.startsWith('/admin/activities') && new URLSearchParams(search).get('status') === 'cho_duyet';
  const { hasAnyPermission, loading: permissionsLoading } = usePermissions();
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    const session = sessionStorageManager.getSession();
    if (session?.user) setProfile(session.user);
    const handleProfileUpdate = (event) => {
      if (event.detail?.profile) setProfile(event.detail.profile);
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('admin-sidebar-collapsed');
    return stored === 'true';
  });
  const asideRef = React.useRef(null);

  React.useEffect(() => {
    const updateVar = () => {
      const el = asideRef.current;
      if (!el) return;
      const w = el.offsetWidth || (sidebarCollapsed ? 80 : 288);
      document.documentElement.style.setProperty('--sidebar-w', `${w}px`);
    };
    updateVar();
    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(updateVar);
      if (asideRef.current) ro.observe(asideRef.current);
    } else {
      window.addEventListener('resize', updateVar);
    }
    return () => {
      if (ro && asideRef.current) ro.unobserve(asideRef.current);
      window.removeEventListener('resize', updateVar);
    };
  }, [sidebarCollapsed]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('admin-sidebar-collapsed', newState.toString());
      const w = newState ? 80 : 288;
      document.documentElement.style.setProperty('--sidebar-w', `${w}px`);
      try { window.dispatchEvent(new Event('admin-sidebar-toggle')); } catch(_) {}
      return newState;
    });
  }, []);

  const isActive = (menuPath) => {
    if (!menuPath) return false;
    const cleanMenuPath = menuPath.replace(/\/$/, '');
    const cleanCurrentPath = path.replace(/\/$/, '');
    if (cleanMenuPath === '/admin') return cleanCurrentPath === '/admin';
    return cleanCurrentPath === cleanMenuPath || cleanCurrentPath.startsWith(cleanMenuPath + '/');
  };

  // Admin menu với permission filtering
  const adminMenu = useMemo(() => {
    const menu: MenuItemData[] = [
      { key: 'dashboard', to: '/admin', label: 'Trang chủ', icon: <Home className="w-5 h-5" />, active: isActive('/admin') },
    ];

    // Users group
    const usersItems = [];
    if (hasAnyPermission(['users.view', 'users.read', 'users.write'])) {
      usersItems.push({ key: 'admin-users', to: '/admin/users', label: 'Tài khoản', icon: <Users className="w-4 h-4" />, active: isActive('/admin/users') });
    }
    if (hasAnyPermission(['roles.read', 'roles.write', 'system.roles'])) {
      usersItems.push({ key: 'admin-roles', to: '/admin/roles', label: 'Vai trò & Quyền', icon: <Shield className="w-4 h-4" />, active: isActive('/admin/roles') });
    }
    if (usersItems.length > 0) {
      menu.push({
        type: 'group', key: 'users', title: 'Người dùng', groupKey: 'users', icon: <Users className="w-5 h-5" />, defaultOpen: true,
        items: usersItems
      });
    }

    // Activities group
    const activitiesItems = [];
    if (hasAnyPermission(['activities.view', 'activities.read', 'activities.write'])) {
      activitiesItems.push({ key: 'admin-activities', to: '/admin/activities', label: 'Danh sách hoạt động', icon: <Activity className="w-4 h-4" />, active: isActive('/admin/activities') && !isApprovalActivities });
    }
    if (hasAnyPermission(['activities.approve'])) {
      activitiesItems.push({ key: 'admin-activity-approvals', to: '/admin/activities?status=cho_duyet', label: 'Phê duyệt hoạt động', icon: <CheckSquare className="w-4 h-4" />, active: isApprovalActivities });
    }
    if (hasAnyPermission(['registrations.approve'])) {
      activitiesItems.push({ key: 'admin-approvals', to: '/admin/approvals', label: 'Phê duyệt đăng ký', icon: <CheckSquare className="w-4 h-4" />, active: isActive('/admin/approvals') });
    }
    if (hasAnyPermission(['attendance.view', 'attendance.read', 'attendance.write', 'attendance.mark'])) {
      activitiesItems.push({ key: 'admin-qr', to: '/admin/qr-attendance', label: 'QR Điểm danh', icon: <QrCode className="w-4 h-4" />, active: isActive('/admin/qr-attendance') });
    }
    if (hasAnyPermission(['activityTypes.read', 'activityTypes.write'])) {
      activitiesItems.push({ key: 'admin-activity-types', to: '/admin/activity-types', label: 'Loại hoạt động', icon: <Layers className="w-4 h-4" />, active: isActive('/admin/activity-types') });
    }
    if (hasAnyPermission(['system.settings', 'system.manage'])) {
      activitiesItems.push({ key: 'admin-semesters', to: '/admin/semesters', label: 'Quản lý học kỳ', icon: <Calendar className="w-4 h-4" />, active: isActive('/admin/semesters') });
    }
    // Face management - luôn hiển cho admin
    activitiesItems.push({ key: 'admin-face-management', to: '/admin/face-management', label: 'Quản lý khuôn mặt', icon: <ScanFace className="w-4 h-4" />, active: isActive('/admin/face-management') });
    if (activitiesItems.length > 0) {
      menu.push({
        type: 'group', key: 'activities', title: 'Hoạt động', groupKey: 'activities', icon: <Activity className="w-5 h-5" />, defaultOpen: true,
        items: activitiesItems
      });
    }

    // Reports
    if (hasAnyPermission(['reports.read', 'reports.view', 'reports.export'])) {
      menu.push({ key: 'reports', to: '/admin/reports', label: 'Báo cáo', icon: <FileText className="w-5 h-5" />, active: isActive('/admin/reports') });
      menu.push({ key: 'attendance-audit', to: '/admin/attendance-audit', label: 'Lịch sử điểm danh', icon: <ShieldAlert className="w-5 h-5" />, active: isActive('/admin/attendance-audit') });
    }

    // Notifications
    if (hasAnyPermission(['notifications.view', 'notifications.read', 'notifications.write', 'notifications.create'])) {
      menu.push({ key: 'notifications', to: '/admin/notifications', label: 'Thông báo', icon: <Bell className="w-5 h-5" />, active: isActive('/admin/notifications') });
    }

    const systemItems = [];
    if (hasAnyPermission(['system.settings', 'system.configure', 'system.manage'])) {
      systemItems.push({ key: 'admin-settings', to: '/admin/settings', label: 'Cài đặt hệ thống', icon: <Settings className="w-4 h-4" />, active: isActive('/admin/settings') });
    }
    if (systemItems.length > 0) {
      menu.push({
        type: 'group', key: 'system', title: 'Hệ thống', groupKey: 'system', icon: <Settings className="w-5 h-5" />, defaultOpen: false,
        items: systemItems
      });
    }

    return menu;
  }, [path, search, isApprovalActivities, hasAnyPermission]);

  const renderMenuItems = useCallback((items) => {
    return items.map(item => {
      if (item.type === 'group') {
        return (
          <Group
            key={item.key}
            title={item.title}
            groupKey={item.groupKey}
            icon={item.icon}
            defaultOpen={item.defaultOpen}
            collapsed={sidebarCollapsed}
          >
            {item.items.map(subItem => (
              <MenuItem
                key={subItem.key}
                to={subItem.to}
                icon={subItem.icon}
                label={subItem.label}
                badge={subItem.badge}
                active={subItem.active}
                collapsed={sidebarCollapsed}
                inDropdown={sidebarCollapsed}
              />
            ))}
          </Group>
        );
      }
      return (
        <MenuItem
          key={item.key}
          to={item.to}
          icon={item.icon}
          label={item.label}
          badge={item.badge}
          active={item.active}
          collapsed={sidebarCollapsed}
        />
      );
    });
  }, [sidebarCollapsed]);

  const initials = (() => {
    const name = profile?.ho_ten || profile?.ten_dn || '';
    if (!name) return 'AD';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0]?.toUpperCase() || 'AD';
  })();

  return (
    <aside 
      ref={asideRef}
      className={`
        fixed left-0 top-0 h-screen z-30 transition-all duration-300
        ${sidebarCollapsed ? 'w-20' : 'w-72'}
        bg-white dark:bg-slate-800
        border-r border-slate-200 dark:border-slate-700
        shadow-sm
        flex flex-col
      `}
    >
      <div className={`h-16 flex items-center border-b border-slate-200 dark:border-slate-700 ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        {sidebarCollapsed ? (
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-lg bg-blue-800 dark:bg-blue-700 flex items-center justify-center shadow-sm hover:bg-blue-900 dark:hover:bg-blue-600 transition-colors cursor-pointer"
            title="Mở rộng sidebar"
          >
            <Activity className="w-5 h-5 text-white" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-800 dark:bg-blue-700 flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">DLU Rèn Luyện</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">Quản trị viên</div>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="touch-target p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors"
              title="Thu gọn sidebar"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-3'}`} style={{ overflowX: 'visible' }}>
        {!sidebarCollapsed && (
          <div className="px-4 mb-4">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Menu quản trị
            </div>
          </div>
        )}
        {renderMenuItems(adminMenu)}
      </nav>

      {!sidebarCollapsed && <SidebarSemesterPicker />}

      {!sidebarCollapsed && profile && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <div className="w-9 h-9 rounded-full bg-blue-800 dark:bg-blue-700 flex items-center justify-center text-white font-semibold text-xs shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {profile?.ho_ten || profile?.ten_dn || 'Quản trị viên'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {profile?.email || profile?.ten_dn || 'Quản trị viên'}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default AdminStudentSidebar;


