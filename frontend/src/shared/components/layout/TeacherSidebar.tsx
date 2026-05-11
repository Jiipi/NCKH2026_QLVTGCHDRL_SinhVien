import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { usePermissions } from '../../hooks/usePermissions';
import layoutApi from '../../../widgets/layout/services/layoutApi';
import '../../styles/teacher-sidebar.css';
import sessionStorageManager from '../../api/sessionStorageManager';
import SemesterFilter from '../../../widgets/semester/ui/SemesterSwitcher';
import useSemesterData, { getGlobalSemester, setGlobalSemester, useGlobalSemesterSync } from '../../hooks/useSemesterData';
import { getCurrentSemesterValue } from '../../lib/semester';
import {
  Users, 
  Calendar, 
  BarChart3, 
  Bell, 
  Activity,
  BookOpen,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  Home,
  Clipboard,
  FolderOpen,
  FileSpreadsheet,
  School,
  Send,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsLeft,
  ChevronsRight,
  UserCheck,
  QrCode,
  User,
  Upload,
  ScanFace
} from 'lucide-react';

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

// MenuItem component với modern design - REMOVED React.memo to allow active state updates
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

  // Show tooltip only when collapsed and NOT in dropdown
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

// Group component với modern design - REMOVED React.memo to allow re-renders
function Group({ title, children, defaultOpen = false, groupKey, icon, collapsed }: GroupProps) {
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem(`teacher-sidebar-group-${groupKey}`);
    return stored !== null ? stored === 'true' : defaultOpen;
  });
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const containerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  
  const handleToggle = useCallback(() => {
    setOpen(prev => {
      const newState = !prev;
      localStorage.setItem(`teacher-sidebar-group-${groupKey}`, newState.toString());
      return newState;
    });
  }, [groupKey]);

  // Khi collapsed, hiển thị submenu dạng dropdown khi hover/click
  if (collapsed) {
    return (
      <div
        className="relative group mb-2"
        ref={containerRef}
        onMouseEnter={() => { if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); } setFlyoutOpen(true); }}
        onMouseLeave={(e) => {
          // Đóng sau một khoảng nhỏ nếu chuột rời hẳn khỏi cả trigger và flyout
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
        {/* Dropdown menu khi hover/click - đảm bảo click được */}
        <div
          className={`absolute left-full ml-2 top-0 min-w-[220px] max-w-[260px] bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-200 z-[100] ${flyoutOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}
          onMouseEnter={() => { if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); } setFlyoutOpen(true); }}
          onMouseLeave={() => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = setTimeout(() => setFlyoutOpen(false), 150);
          }}
        >
          {/* Header */}
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
          </div>
          {/* Menu items */}
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
        style={{ 
          maxHeight: open ? '500px' : '0',
          opacity: open ? 1 : 0
        }}
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

// Remove React.memo to allow re-render when location changes
function TeacherSidebar(props) {
  const storeRole = useAppStore(s => s.role);
  const roleProp = props?.role || null;
  const role = (roleProp || storeRole || '').toString().toLowerCase();
  const location = useLocation();
  const path = location.pathname;
  const roleUpper = role.toUpperCase();
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
  
  // Permission checking
  const { hasAnyPermission, loading: permissionsLoading } = usePermissions();
  
  // Pending registrations count
  const [pendingCount, setPendingCount] = useState(0);
  
  // Debug: Log current path on every render (disabled in production)
  // console.log('[TeacherSidebar] RENDER - Current path:', path);
  
  // Sidebar toggle state với persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('teacher-sidebar-collapsed');
    return stored === 'true';
  });
  const asideRef = React.useRef(null);

  // Sync CSS variable --sidebar-w for layout calculations
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

  // Toggle sidebar function
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('teacher-sidebar-collapsed', newState.toString());
      
      // Update CSS variable immediately with the new state
      const w = newState ? 80 : 288;
      document.documentElement.style.setProperty('--sidebar-w', `${w}px`);
      
      // dispatch a custom event so layout in same tab can react immediately
      setTimeout(() => {
        try { window.dispatchEvent(new Event('teacher-sidebar-toggle')); } catch(_) {}
      }, 0);
      
      return newState;
    });
  }, []);
  
  // Fetch pending registrations count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await layoutApi.getTeacherPendingRegistrations();
        const data = response.items || response.data || response || [];
        const pendingRegs = Array.isArray(data) ? data.filter(r => r.trang_thai_dk === 'cho_duyet') : [];
        setPendingCount(pendingRegs.length);
      } catch (err) {
        console.error('Error fetching pending count:', err);
      }
    };
    
    fetchPendingCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Use refs to prevent unnecessary re-renders
  const prevRoleRef = useRef(role);
  const prevPathRef = useRef(path);
  const stableRoleRef = useRef(role);
  const stablePathRef = useRef(path);
  
  // Only update refs if values actually changed
  if (prevRoleRef.current !== role || prevPathRef.current !== path) {
    prevRoleRef.current = role;
    prevPathRef.current = path;
    stableRoleRef.current = role;
    stablePathRef.current = path;
  }
  
  // NEW ALGORITHM: Direct path comparison + sub-routes highlighting
  const getActiveState = (menuPath) => {
    if (!menuPath) return false;
    
    // Clean paths
    const cleanMenuPath = menuPath.replace(/\/$/, '');
    const cleanCurrentPath = path.replace(/\/$/, '');
    
    // Special-case dashboard: only active on exact '/teacher'
    if (cleanMenuPath === '/teacher') {
      return cleanCurrentPath === '/teacher';
    }
    
    // Direct comparison (exact match)
    if (cleanCurrentPath === cleanMenuPath) return true;
    
    // Sub-route check: highlight parent menu when on sub-routes
    // Example: /teacher/students should be active when on /teacher/students/import
    if (cleanCurrentPath.startsWith(cleanMenuPath + '/')) return true;
    
    return false;
  };

  // Teacher menu structure with permission filtering
  const teacherMenu = useMemo(() => {
    const menu: MenuItemData[] = [
      // Dashboard - Trang chủ (luôn hiển thị)
      {
        key: 'dashboard',
        to: '/teacher',
        label: 'Trang chủ',
        icon: <Home className="w-5 h-5" />,
        active: getActiveState('/teacher')
      },
    ];
    
    // Quản lý hoạt động - Group
    const activityItems = [];
    if (hasAnyPermission(['activities.approve', 'activities.reject'])) {
      activityItems.push({
        key: 'pending-activities',
        to: '/teacher/approve',
        label: 'Phê duyệt hoạt động',
        icon: <Clipboard className="w-4 h-4" />,
        active: getActiveState('/teacher/approve')
      });
    }
    if (hasAnyPermission(['registrations.approve', 'registrations.reject', 'registrations.write'])) {
      activityItems.push({
        key: 'pending-registrations',
        to: '/teacher/registrations/approve',
        label: 'Phê duyệt đăng ký',
        icon: <UserCheck className="w-4 h-4" />,
        active: getActiveState('/teacher/registrations/approve'),
        badge: pendingCount > 0 ? pendingCount : null
      });
    }
    if (hasAnyPermission(['activities.view', 'activities.read', 'activities.write'])) {
      activityItems.push({
        key: 'all-activities',
        to: '/teacher/activities',
        label: 'Danh mục hoạt động',
        icon: <Calendar className="w-4 h-4" />,
        active: getActiveState('/teacher/activities')
      });
    }
    // Đã xóa mục Điểm danh theo yêu cầu - Giảng viên không cần chức năng này
    // Thêm mục Quản lý khuôn mặt
    activityItems.push({
      key: 'face-management',
      to: '/teacher/face-management',
      label: 'Duyệt khuôn mặt SV',
      icon: <ScanFace className="w-4 h-4" />,
      active: getActiveState('/teacher/face-management')
    });
    if (activityItems.length > 0) {
      menu.push({
        type: 'group',
        key: 'activity-management',
        title: 'Quản lý hoạt động',
        groupKey: 'activity-management',
        icon: <Activity className="w-5 h-5" />,
        defaultOpen: true,
        items: activityItems
      });
    }

    // Quản lý sinh viên - Group
    const studentItems = [];
    if (hasAnyPermission(['students.read', 'students.update', 'classmates.read'])) {
      studentItems.push({
        key: 'student-list',
        to: '/teacher/students',
        label: 'Danh sách sinh viên',
        icon: <Users className="w-4 h-4" />,
        active: getActiveState('/teacher/students')
      });
    }
    if (hasAnyPermission(['points.view_all', 'scores.read', 'students.read'])) {
      studentItems.push({
        key: 'student-scores',
        to: '/teacher/student-scores',
        label: 'Điểm sinh viên',
        icon: <TrendingUp className="w-4 h-4" />,
        active: getActiveState('/teacher/student-scores')
      });
    }
    if (hasAnyPermission(['students.update', 'users.write'])) {
      studentItems.push({
        key: 'student-import',
        to: '/teacher/students/import',
        label: 'Import sinh viên',
        icon: <Upload className="w-4 h-4" />,
        active: getActiveState('/teacher/students/import')
      });
    }
    if (studentItems.length > 0) {
      menu.push({
        type: 'group',
        key: 'student-management',
        title: 'Quản lý sinh viên',
        groupKey: 'student-management',
        icon: <Users className="w-5 h-5" />,
        defaultOpen: false,
        items: studentItems
      });
    }

    // Báo cáo & Thống kê - Group
    if (hasAnyPermission(['reports.read', 'reports.view', 'reports.export'])) {
      menu.push({
        type: 'group',
        key: 'reports-analytics',
        title: 'Báo cáo & Thống kê',
        groupKey: 'reports-analytics',
        icon: <BarChart3 className="w-5 h-5" />,
        defaultOpen: false,
        items: [
          {
            key: 'statistics',
            to: '/teacher/reports',
            label: 'Thống kê & Báo cáo',
            icon: <TrendingUp className="w-4 h-4" />,
            active: getActiveState('/teacher/reports')
          }
        ]
      });
    }

    // Quản lý thông báo - Group
    if (hasAnyPermission(['notifications.view', 'notifications.read', 'notifications.write', 'notifications.create'])) {
      menu.push({
        type: 'group',
        key: 'notifications',
        title: 'Thông báo',
        groupKey: 'notifications',
        icon: <Bell className="w-5 h-5" />,
        defaultOpen: false,
        items: [
          {
            key: 'notification-list',
            to: '/teacher/notifications',
            label: 'Danh sách thông báo',
            icon: <MessageSquare className="w-4 h-4" />,
            active: getActiveState('/teacher/notifications')
          }
        ]
      });
    }

    return menu;
  }, [path, hasAnyPermission, pendingCount]);

  // Render menu items
  const renderMenuItem = useCallback((item) => {
    
    if (item.type === 'group') {
      return (
        <Group 
          key={item.key}
          title={item.title}
          defaultOpen={item.defaultOpen}
          groupKey={item.groupKey}
          icon={item.icon}
          collapsed={sidebarCollapsed}
        >
          {item.items
            .filter(subItem => subItem && subItem.to && subItem.label)
            .map(subItem => (
            <MenuItem
              key={subItem.key}
              to={subItem.to}
              label={subItem.label}
              icon={subItem.icon}
              active={subItem.active}
              badge={subItem.badge}
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
        label={item.label}
        icon={item.icon}
        active={item.active}
        badge={item.badge}
        collapsed={sidebarCollapsed}
        inDropdown={false}
      />
    );
  }, [sidebarCollapsed]);

  const initials = (() => {
    const name = profile?.ho_ten || profile?.ten_dn || '';
    if (!name) return 'GV';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0]?.toUpperCase() || 'GV';
  })();

  return (
    <aside ref={asideRef} className={`
      fixed left-0 top-0 h-screen z-30 transition-all duration-300
      ${sidebarCollapsed ? 'w-20' : 'w-72'}
      bg-white dark:bg-slate-800
      border-r border-slate-200 dark:border-slate-700
      shadow-sm
      flex flex-col
    `}>
      {/* Brand Header với gradient */}
      <div className={`h-16 flex items-center border-b border-slate-200 dark:border-slate-700 ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        {sidebarCollapsed ? (
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-lg bg-blue-800 dark:bg-blue-700 flex items-center justify-center shadow-sm hover:bg-blue-900 dark:hover:bg-blue-600 transition-colors cursor-pointer"
            title="Mở rộng sidebar"
          >
            <Users className="w-5 h-5 text-white" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-800 dark:bg-blue-700 flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">DLU Rèn Luyện</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">Giảng viên</div>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors"
              title="Thu gọn sidebar"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      
      {/* Navigation Menu */}
      <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-3'}`} style={{ overflowX: 'visible' }}>
        {!sidebarCollapsed && (
          <div className="px-4 mb-4">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Menu chính
            </div>
          </div>
        )}
        {teacherMenu.map(renderMenuItem)}
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
                {profile?.ho_ten || profile?.ten_dn || 'Giảng viên'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {profile?.email || profile?.ma_gv || profile?.ma_cb || 'Giảng viên'}
              </p>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}

export default TeacherSidebar;
