import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Shield, Users, Plus, Edit, Trash2, Eye, Search, X, Save, Crown, Key, Lock, Clock, CheckCircle, XCircle, Sparkles, MapPin, Calendar } from 'lucide-react';
import { extractUsersFromAxiosResponse } from '../../../../../shared/lib/apiNormalization';
import { getUserAvatar, getStudentAvatar } from '../../../../../shared/lib/avatar';
import { adminRolesApi } from '../../../services';
import Pagination from '../../../../../shared/components/common/Pagination';

// Interfaces for type safety
interface RoleData {
  id: string;
  ten_vt: string;
  mo_ta?: string;
  quyen_han?: string[];
  // Allow additional properties from RawRole
  [key: string]: unknown;
}

interface UserData {
  id: string;
  ten_dn?: string;
  ho_ten?: string;
  email?: string;
  trang_thai?: string;
  khoa?: boolean;
  mssv?: string;
  vai_tro?: { id?: string; ten_vt: string };
  sinh_vien?: { mssv?: string; lop?: { ten_lop?: string } };
  [key: string]: unknown;
}

interface PaginationInfo {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

interface RolePermissionEditorProps {
  role: RoleData;
  allPermissions: string[];
  onSaved?: (payload: { ten_vt: string; mo_ta: string; quyen_han: string[] }) => Promise<void>;
  useCanonical?: boolean;
  onRestoreOriginal?: (() => void) | null;
  legacyToCanonical?: Record<string, string[]>;
}

export default function AdminRoles() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [roleFilter, setRoleFilter] = useState<RoleData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(10);
  const [userTotal, setUserTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  // Test-only: toggle to use canonical backend slugs in UI
  const [useCanonicalSlugs, setUseCanonicalSlugs] = useState(false);
  // Backup original permissions per role to allow restore after testing
  const [permsBackupByRoleId, setPermsBackupByRoleId] = useState<Record<string, string[]>>({});
  // Removed status filter per request
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  // Active users from sessions (for real-time status display)
  const [activeUserIds, setActiveUserIds] = useState<Set<string>>(new Set());

  // Fetch active sessions to determine who is online
  const fetchActiveSessions = useCallback(async () => {
    try {
      setActiveUserIds(await adminRolesApi.getActiveUserIds(5));
    } catch (error) {
      console.error('Lỗi khi tải phiên hoạt động:', error);
    }
  }, []);

  // Get derived status based on session activity (same logic as AdminUsersPage)
  const getDerivedStatus = useCallback((user: { id?: string; ten_dn?: string; trang_thai?: string; khoa?: boolean; mssv?: string; sinh_vien?: { mssv?: string } }) => {
    const locked = user.trang_thai === 'khoa' || user.khoa === true;
    if (locked) return 'khoa';
    
    const isActiveNow = activeUserIds.has(String(user.id)) || 
                        activeUserIds.has(String(user.ten_dn)) ||
                        (user.sinh_vien?.mssv && activeUserIds.has(String(user.sinh_vien.mssv))) ||
                        (user.mssv && activeUserIds.has(String(user.mssv)));
    return isActiveNow ? 'hoat_dong' : 'khong_hoat_dong';
  }, [activeUserIds]);

  const buttonStyle = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: 'white',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14
  };

  const getRoleIcon = (roleName) => {
    const name = (roleName || '').toLowerCase();
    if (name.includes('admin')) return <Crown size={18} style={{ color: '#f59e0b' }} />;
    if (name.includes('giảng viên') || name.includes('giang vien')) return <Key size={18} style={{ color: '#3b82f6' }} />;
    if (name.includes('lớp trưởng') || name.includes('lop truong')) return <Shield size={18} style={{ color: '#8b5cf6' }} />;
    return <Users size={18} style={{ color: '#10b981' }} />;
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = String(fullName).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Fetch active sessions on mount and refresh every 5 seconds
  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(() => {
      fetchActiveSessions();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchActiveSessions]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingRoles(true);
        setAuthError(false);
        const rs = await adminRolesApi.getRoles();
        setRoles(rs);
        if (rs.length > 0) setRoleFilter(rs[0]);
        fetchRoleCounts(rs);
      } catch (e) {
        if (e.response?.status === 401 || e.response?.status === 403) setAuthError(true);
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!roleFilter) return;
    fetchUsers({
      page: 1,
      limit: userLimit,
      role: roleFilter.ten_vt,
      search: searchApplied
    });
  }, [roleFilter?.id, searchApplied]);

  // Ensure roleFilter has fresh quyen_han from backend (list API may omit/normalize)
  useEffect(() => {
    (async () => {
      if (!roleFilter?.id) return;
      try {
        const data = await adminRolesApi.getRoleDetail(roleFilter.id);
        
        console.log('?? Loaded fresh role permissions from API:', {
          roleId: data.id,
          roleName: data.ten_vt,
          permissions: data.quyen_han
        });
        
        // Always update roleFilter with fresh data from API
        setRoleFilter({ ...data });
      } catch (err) {
        console.error('? Failed to load role details:', err);
      }
    })();
  }, [roleFilter?.id]);

  async function fetchRoleCounts(list?: RoleData[]) {
    const arr = Array.isArray(list) ? list : roles;
    if (!arr || arr.length === 0) return;
    try {
      const pairs = await Promise.all(
        arr.map(async (r) => {
          try {
            const result = await adminRolesApi.fetchUsers({ role: r.ten_vt, page: 1, limit: 1 });
            if (result.success) {
              const data = result.data as { pagination?: { total?: number }; total?: number } | undefined;
              const total = data?.pagination?.total ?? data?.total ?? 0;
              return [r.id, total];
            } else {
              // Chỉ log warning, không log full error để tránh spam console
              if (result.code !== 500) {
                console.warn(`Lỗi đếm người dùng cho role ${r.ten_vt}:`, result.error);
              }
              return [r.id, 0];
            }
          } catch (err) {
            // Chỉ log nếu không phải 500 để tránh spam
            if (err?.response?.status !== 500) {
              console.warn(`Lỗi đếm người dùng cho role ${r.ten_vt}:`, err);
            }
            return [r.id, 0];
          }
        })
      );
      const map = {};
      pairs.forEach(([id, total]) => (map[id] = total));
      setRoleCounts(map);
    } catch (e) {
      console.error('Lỗi đếm số người dùng theo vai trò', e?.message);
    }
  }

  async function deleteRole(roleId: string) {
    if (!window.confirm('Bạn có chắc muốn xóa vai trò này?')) return;
    if (!window.confirm('Xóa luôn TẤT CẢ người dùng đang thuộc vai trò này? Hành động này không thể hoàn tác.')) return;
    try {
      await adminRolesApi.deleteRole(roleId);
      const rs = await adminRolesApi.getRoles();
      setRoles(rs);
      if (!rs.find(r => r.id === roleFilter?.id)) setRoleFilter(rs[0] || null);
      fetchRoleCounts(rs);
    } catch (e) {
      console.error('Xóa vai trò thất bại', e.response?.data || e.message);
    }
  }

  // Legacy slugs (current UI)
  const LEGACY_PERMISSION_SLUGS = [
    'users.read','users.write','users.delete',
    'activities.read','activities.write','activities.delete','activities.approve',
    'registrations.read','registrations.write','registrations.delete',
    'attendance.read','attendance.write','attendance.delete',
    'reports.read','reports.export','roles.read','roles.write','roles.delete',
    'notifications.read','notifications.write','notifications.delete',
    'students.read','students.update','classmates.read','classmates.assist',
    'profile.read','profile.update','scores.read',
    'system.manage','system.configure',
    'activityTypes.read','activityTypes.write','activityTypes.delete'
  ];

  // Canonical slugs (backend aligned) for testing
  const CANONICAL_PERMISSION_SLUGS = [
    'users.read','users.write','users.delete',
    'activities.view','activities.create','activities.update','activities.delete','activities.approve','activities.reject',
    'registrations.register','registrations.cancel','registrations.approve','registrations.reject',
    'attendance.view','attendance.mark','attendance.write',
    'reports.read','reports.export','roles.read','roles.write','roles.delete',
    'notifications.view','notifications.create','notifications.manage',
    'students.read','students.update','classmates.read','classmates.assist',
    'profile.read','profile.update','scores.read',
    'system.manage','system.configure',
    'activityTypes.read','activityTypes.write','activityTypes.delete'
  ];

  // Mapping legacy UI slugs to canonical backend slugs
  const LEGACY_TO_CANONICAL = {
    // Users
    'users.read': ['users.view'],
    'users.write': ['users.create','users.update'],
    'users.delete': ['users.delete'],
    // Activities
    'activities.read': ['activities.view'],
    'activities.write': ['activities.create','activities.update'],
    'activities.delete': ['activities.delete'],
    'activities.approve': ['activities.approve','activities.reject'],
    // Registrations
    'registrations.read': ['registrations.view'],
    'registrations.write': ['registrations.approve','registrations.reject','registrations.register','registrations.cancel'],
    'registrations.delete': [],
    // Attendance
    'attendance.read': ['attendance.view'],
    'attendance.write': ['attendance.write'], // Map trực tiếp sang attendance.write (không phải attendance.mark)
    'attendance.delete': [],
    // Notifications
    'notifications.read': ['notifications.view'],
    'notifications.write': ['notifications.create'],
    'notifications.delete': ['notifications.manage'],
    // Reports
    'reports.read': ['reports.view'],
    'reports.export': ['reports.export'],
    // Roles (map to system.roles management)
    'roles.read': ['system.roles'],
    'roles.write': ['system.roles'],
    'roles.delete': ['system.roles'],
    // Students & classmates (keep as-is for now; backend may not enforce)
    'students.read': ['students.read'], 'students.update': ['students.update'],
    'classmates.read': ['classmates.read'], 'classmates.assist': ['classmates.assist'],
    // Profile
    'profile.read': ['profile.read'], 'profile.update': ['profile.update'],
    // Scores -> points
    'scores.read': ['points.view_all','points.view_own'],
    // System
    'system.manage': ['system.dashboard','system.roles','system.settings','system.logs'],
    'system.configure': ['system.settings'],
    // Activity types
    'activityTypes.read': ['activityTypes.read'], 'activityTypes.write': ['activityTypes.write'], 'activityTypes.delete': ['activityTypes.delete']
  };

  // Project current role permissions into canonical space (for display only)
  const toCanonicalSet = (list) => {
    const set = new Set();
    (Array.isArray(list) ? list : []).forEach((p) => {
      if (CANONICAL_PERMISSION_SLUGS.includes(p)) set.add(p);
      else if (LEGACY_TO_CANONICAL[p]) LEGACY_TO_CANONICAL[p].forEach((q) => set.add(q));
    });
    return set;
  };

  const roleNotes = [
    { key: 'ADMIN', name: 'ADMIN', icon: getRoleIcon('ADMIN'), color: '#fff7ed', items: [
      'Quản trị hệ thống, người dùng, vai trò',
      'Quản lý loại hoạt động'
    ] },
    { key: 'GIANG_VIEN', name: 'GIẢNG VIÊN', icon: getRoleIcon('GIANG_VIEN'), color: '#eff6ff', items: [
      'Tạo và quản lý hoạt động',
      'Điểm danh, theo dõi đăng ký'
    ] },
    { key: 'LOP_TRUONG', name: 'LỚP TRƯỞNG', icon: getRoleIcon('LOP_TRUONG'), color: '#f5f3ff', items: [
      'Theo dõi hoạt động lớp',
      'Hỗ trợ điểm danh'
    ] },
    { key: 'SINH_VIEN', name: 'SINH VIÊN', icon: getRoleIcon('SINH_VIEN'), color: '#f0fdf4', items: [
      'Đăng ký tham gia hoạt động',
      'Xem điểm rèn luyện'
    ] }
  ];

  const roleNameLower = (roleFilter?.ten_vt || '').toLowerCase();
  const isStudent = roleNameLower.includes('sinh');
  const isAdmin = roleNameLower.includes('admin');
  const totalPages = Math.max(1, Math.ceil((userTotal || 0) / userLimit) || 1);
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * userLimit;
    return users.slice(start, start + userLimit);
  }, [users, userPage, userLimit]);

  useEffect(() => {
    if (userPage > totalPages) {
      setUserPage(totalPages);
    }
  }, [totalPages, userPage]);

  if (authError) {
    return (
      <div style={{ padding: 24 }}>Bạn không có quyền truy cập hoặc phiên đã hết hạn.</div>
    );
  }

  function applySearch() {
    setSearchApplied(searchTerm.trim());
    setUserPage(1);
  }

  async function fetchUsers({ page = 1, limit = 10, role = '', search = '' } = {}) {
    try {
      setUsersLoading(true);
      const effectiveLimit = role ? Math.max(limit, 200) : limit;
      const baseParams = { page: 1, limit: effectiveLimit, role, search };
      const result = await adminRolesApi.fetchUsers(baseParams);
      
      if (result.success) {
        const data = (result.data || {}) as { pagination?: PaginationInfo; users?: UserData[] };
        const paginationInfo = data.pagination || {};
        let list = Array.isArray(data.users)
          ? data.users
          : extractUsersFromAxiosResponse({ data });

        if (role && paginationInfo?.totalPages > 1) {
          const extraPages = [];
          for (let nextPage = 2; nextPage <= paginationInfo.totalPages; nextPage++) {
            extraPages.push(
              adminRolesApi.fetchUsers({ ...baseParams, page: nextPage })
            );
          }

          const responses = await Promise.all(extraPages);
          responses.forEach((res) => {
            if (res.success) {
              const resData = (res.data || {}) as { users?: UserData[] };
              const more = Array.isArray(resData.users)
                ? resData.users as UserData[]
                : (extractUsersFromAxiosResponse({ data: resData }) as unknown as UserData[]);
              list = [...list, ...more] as UserData[];
            }
          });
          setUsers(list as UserData[]);
          setUserTotal(list.length);
          setUserPage(1);
        } else {
          setUsers(list as UserData[]);
          const total = paginationInfo?.total ?? (typeof list.length === 'number' ? list.length : 0);
          setUserTotal(total);
        }
      } else {
        console.error('Lỗi tải người dùng', result);
        setUsers([]);
        setUserTotal(0);
      }
    } catch (e) {
      console.error('Lỗi tải người dùng', e.response?.data || e.message);
      setUsers([]);
      setUserTotal(0);
    } finally {
      setUsersLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(20,184,166,0.12),transparent_28%)]" />
        <div className="relative z-10 space-y-6">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
              <Sparkles className="h-4 w-4" />
              {roles.length} vai trò
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/55 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Quản trị vai trò & quyền</h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">Quản lý vai trò, phân quyền và người dùng trong hệ thống.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { setRoleFilter(r); setUserPage(1); }}
                className={`rounded-2xl border p-4 text-left shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-lg dark:hover:bg-white/10 ${
                  roleFilter?.id === r.id
                    ? 'border-indigo-200/80 bg-indigo-50/70 ring-4 ring-indigo-100/70 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:ring-indigo-400/20'
                    : 'border-white/65 bg-white/55 dark:border-white/10 dark:bg-slate-900/45'
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/70 bg-white/55 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">{getRoleIcon(r.ten_vt)}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Vai trò</span>
                </div>
                <p className="text-3xl font-black leading-none tracking-[-0.05em] text-slate-950 dark:text-white">{roleCounts[r.id] ?? 0}</p>
                <p className="mt-2 truncate text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">{r.ten_vt}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <div style={{ 
        background: 'white', 
        borderRadius: 16, 
        border: '2px solid #e5e7eb', 
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
        padding: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <Search size={20} style={{ color: '#9ca3af' }} />
            </div>
            <input 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="Tìm theo tên, email, mã số..." 
              style={{ 
                width: '100%',
                paddingLeft: 48,
                paddingRight: 16,
                paddingTop: 12,
                paddingBottom: 12,
                border: '2px solid #e5e7eb', 
                borderRadius: 12, 
                fontSize: 14,
                transition: 'all 0.2s',
                outline: 'none'
              }} 
            />
          </div>
          <button 
            onClick={applySearch} 
            style={{ 
              padding: '12px 24px',
              borderRadius: 12,
              border: '2px solid #6366f1',
              background: '#6366f1',
              color: 'white',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(99,102,241,0.2)',
              whiteSpace: 'nowrap'
            }}
          >
            <Search size={16} /> Tìm kiếm
          </button>
        </div>
      </div>

      {/* Role Filter Pills */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {roles.map((r) => {
          const active = roleFilter?.id === r.id;
          const roleColors = {
            admin: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', activeBg: '#fee2e2', activeBorder: '#f87171' },
            giang: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', activeBg: '#fde68a', activeBorder: '#fbbf24' },
            lop: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', activeBg: '#bfdbfe', activeBorder: '#60a5fa' },
            sinh: { bg: '#dcfce7', border: '#86efac', text: '#15803d', activeBg: '#bbf7d0', activeBorder: '#4ade80' }
          };
          const nameKey = r.ten_vt.toLowerCase().includes('admin') ? 'admin' :
                         r.ten_vt.toLowerCase().includes('giang') ? 'giang' :
                         r.ten_vt.toLowerCase().includes('lop') ? 'lop' : 'sinh';
          const clr = roleColors[nameKey];
          
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button 
                onClick={() => { setRoleFilter(r); setUserPage(1); }}
                style={{ 
                  padding: '10px 20px',
                  borderRadius: 12,
                  border: `2px solid ${active ? clr.activeBorder : clr.border}`,
                  background: active ? clr.activeBg : clr.bg,
                  color: clr.text,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  fontWeight: active ? 700 : 600,
                  transition: 'all 0.2s',
                  boxShadow: active ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {getRoleIcon(r.ten_vt)} 
                <span>{r.ten_vt}</span>
                <span style={{ 
                  background: 'rgba(0,0,0,0.1)', 
                  padding: '2px 8px', 
                  borderRadius: 9999, 
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {roleCounts[r.id] ?? 0}
                </span>
              </button>
              <button 
                onClick={() => deleteRole(r.id)} 
                title="Xóa vai trò (kèm xóa mọi người dùng thuộc vai trò)" 
                style={{ 
                  padding: 10,
                  borderRadius: 12,
                  border: '2px solid #fca5a5',
                  background: '#fef2f2',
                  color: '#dc2626',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Permission editor for selected role */}
      {roleFilter && (
        <RolePermissionEditor
          role={useCanonicalSlugs ? { ...roleFilter, quyen_han: Array.from(toCanonicalSet(roleFilter.quyen_han)) as string[] } : roleFilter}
          allPermissions={useCanonicalSlugs ? CANONICAL_PERMISSION_SLUGS : LEGACY_PERMISSION_SLUGS}
          useCanonical={useCanonicalSlugs}
          legacyToCanonical={LEGACY_TO_CANONICAL}
          onRestoreOriginal={useCanonicalSlugs && permsBackupByRoleId[roleFilter.id]?.length ? async () => {
            try {
              const orig = permsBackupByRoleId[roleFilter.id] || [];
              await adminRolesApi.updateRole(roleFilter.id, { ten_vt: roleFilter.ten_vt, mo_ta: roleFilter.mo_ta, quyen_han: orig });
              const rs = await adminRolesApi.getRoles();
              setRoles(rs);
              const cur = rs.find(r => r.id === roleFilter.id) || rs[0] || null;
              setRoleFilter(cur);
              fetchRoleCounts(rs);
            } catch (e: unknown) {
              const err = e as { response?: { data?: unknown }; message?: string };
              console.error('Khôi phục quyền cũ thất bại', err.response?.data || err.message);
            }
          } : null}
          onSaved={async (updated) => {
            try {
              console.log('?? Updating role permissions via API:', updated);
              
              await adminRolesApi.updateRole(roleFilter.id, {
                ten_vt: updated.ten_vt,
                mo_ta: updated.mo_ta,
                quyen_han: updated.quyen_han,
              });
              
              console.log('? Role permissions saved successfully');
              
              // Refresh roles list
              const rs = await adminRolesApi.getRoles();
              setRoles(rs);
              
              // Reload the current role with fresh data from API
              const freshData = await adminRolesApi.getRoleDetail(roleFilter.id);
              
              console.log('?? Reloaded role after save:', {
                roleId: freshData.id,
                permissions: freshData.quyen_han
              });
              
              setRoleFilter({ ...freshData } as RoleData);
              fetchRoleCounts(rs);
            } catch (e: unknown) {
              const err = e as { response?: { data?: { message?: string } }; message?: string };
              console.error('❌ Cập nhật quyền vai trò thất bại:', err.response?.data || err.message);
              alert('Cập nhật quyền vai trò thất bại: ' + (err.response?.data?.message || err.message));
            }
          }}
        />
      )}

      {/* Users List Container */}
      <div style={{ 
        background: 'white', 
        borderRadius: 16, 
        border: '2px solid #e5e7eb', 
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.5fr 1.2fr 0.8fr 0.8fr 0.6fr', 
          padding: '16px 20px', 
          background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)', 
          borderBottom: '2px solid #e5e7eb',
          fontWeight: 700,
          fontSize: 13,
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} /> Thông tin
          </div>
          <div>Email</div>
          {isStudent ? (<><div>Lớp</div><div>Khoa</div></>) : isAdmin ? (<><div>Quyền</div><div>HĐ tạo</div></>) : (<><div>Lớp CN</div><div>HĐ tạo</div></>)}
          <div>Trạng thái</div>
        </div>

        {/* User Cards */}
        {usersLoading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'relative', width: 48, height: 48 }}>
                <div style={{ 
                  position: 'absolute',
                  inset: 0,
                  border: '4px solid #e5e7eb',
                  borderRadius: '50%'
                }}></div>
                <div style={{ 
                  position: 'absolute',
                  inset: 0,
                  border: '4px solid #6366f1',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
              <p style={{ color: '#6b7280', fontSize: 14, fontWeight: 500 }}>Đang tải người dùng...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <Users size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
            <p style={{ color: '#9ca3af', fontSize: 16, fontWeight: 500 }}>Không tìm thấy người dùng</p>
            <p style={{ color: '#d1d5db', fontSize: 14, marginTop: 8 }}>Thử thay đổi bộ lọc hoặc tìm kiếm</p>
          </div>
        ) : (
          paginatedUsers.map((u, idx) => {
            const avatar = u?.sinh_vien ? getStudentAvatar(u.sinh_vien) : getUserAvatar(u);
            const roleName = u?.vai_tro?.ten_vt || roleFilter?.ten_vt || '';
            const roleClr = (() => {
              const name = String(roleName || '').toLowerCase();
              if (name.includes('admin')) return { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' };
              if (name.includes('giang')) return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
              if (name.includes('lop')) return { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' };
              if (name.includes('sinh')) return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
              return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
            })();
            
            return (
              <div 
                key={u.id} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.5fr 1.2fr 0.8fr 0.8fr 0.6fr', 
                  padding: '16px 20px', 
                  borderTop: idx === 0 ? 'none' : '1px solid #f3f4f6',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  background: 'white'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
              >
                {/* User Info with Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    {avatar.hasValidAvatar ? (
                      <img 
                        src={avatar.src} 
                        alt={avatar.alt}
                        style={{ 
                          width: 44, 
                          height: 44, 
                          borderRadius: '50%', 
                          objectFit: 'cover', 
                          border: `3px solid ${roleClr.border}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => { 
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none'; 
                          const next = target.nextSibling as HTMLElement | null;
                          if (next) next.style.display = 'flex'; 
                        }} 
                      />
                    ) : null}
                    <div style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: '50%', 
                      background: roleClr.bg, 
                      color: roleClr.color, 
                      display: avatar.hasValidAvatar ? 'none' : 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 700,
                      fontSize: 16,
                      border: `3px solid ${roleClr.border}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {avatar.fallback}
                    </div>
                    {/* Status Indicator - based on session activity */}
                    {(() => {
                      const derivedStatus = getDerivedStatus(u);
                      const indicatorColor = derivedStatus === 'khoa' ? '#ef4444' : derivedStatus === 'hoat_dong' ? '#22c55e' : '#f59e0b';
                      return (
                        <div style={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          right: 0, 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          background: indicatorColor,
                          border: '2px solid white',
                          boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                        }}></div>
                      );
                    })()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 2 }}>
                      {String(u.ho_ten || u.hoten || '')}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      color: '#6b7280', 
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      <Shield size={12} />
                      {String(u.maso || u.ten_dn || '')}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{ fontSize: 13, color: '#4b5563', fontWeight: 500 }}>
                  {String(u.email || '—')}
                </div>

                {/* Dynamic Columns */}
                {isStudent ? (
                  <>
                    <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{String(u.lop || '—')}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{String(u.khoa || '—')}</div>
                  </>
                ) : isAdmin ? (
                  <>
                    <div style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      background: '#eff6ff',
                      color: '#1e40af',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      width: 'fit-content'
                    }}>
                      <Key size={12} /> {Number(u.quyen_count ?? 0)}
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{Number(u.so_hd_tao ?? 0)}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{Number(u.so_lop_cn ?? 0)}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{Number(u.so_hd_tao ?? 0)}</div>
                  </>
                )}

                {/* Status Badge - based on session activity */}
                <div>
                  {(() => {
                    const derivedStatus = getDerivedStatus(u);
                    const isLocked = derivedStatus === 'khoa';
                    const isActive = derivedStatus === 'hoat_dong';
                    // khong_hoat_dong = không locked và không có session active
                    const statusStyle = isLocked 
                      ? { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', text: 'Khóa', Icon: XCircle }
                      : isActive
                        ? { bg: '#dcfce7', color: '#166534', border: '#86efac', text: 'Hoạt động', Icon: CheckCircle }
                        : { bg: '#fef3c7', color: '#92400e', border: '#fcd34d', text: 'Không HĐ', Icon: Clock };
                    return (
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12, 
                        padding: '6px 12px', 
                        borderRadius: 9999, 
                        background: statusStyle.bg, 
                        color: statusStyle.color,
                        fontWeight: 700,
                        border: `2px solid ${statusStyle.border}`
                      }}>
                        <statusStyle.Icon size={14} />
                        {statusStyle.text}
                      </span>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {userTotal > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 mt-4">
          <Pagination
            pagination={{ page: userPage, limit: userLimit, total: userTotal }}
            onPageChange={(newPage) => setUserPage(newPage)}
            onLimitChange={(newLimit) => { setUserLimit(Number(newLimit)); setUserPage(1); }}
            itemLabel="người dùng"
            showLimitSelector={true}
          />
        </div>
      )}


    </div>
  );
}

function RolePermissionEditor({ role, allPermissions, onSaved, useCanonical, onRestoreOriginal, legacyToCanonical }: RolePermissionEditorProps) {
  const [name, setName] = React.useState(role.ten_vt || '');
  const [desc, setDesc] = React.useState(role.mo_ta || '');
  const [setDirty, setSetDirty] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(Array.isArray(role.quyen_han) ? new Set(role.quyen_han) : new Set());

  // Mapping permission slugs sang tiếng Việt
  const PERMISSION_LABELS = {
    // Users
    'users.read': 'Xem người dùng',
    'users.write': 'Sửa người dùng',
    'users.delete': 'Xóa người dùng',
    'users.view': 'Xem người dùng',
    'users.create': 'Tạo người dùng',
    'users.update': 'Cập nhật người dùng',
    // Activities
    'activities.read': 'Xem hoạt động',
    'activities.write': 'Sửa hoạt động',
    'activities.delete': 'Xóa hoạt động',
    'activities.approve': 'Duyệt hoạt động',
    'activities.view': 'Xem hoạt động',
    'activities.create': 'Tạo hoạt động',
    'activities.update': 'Cập nhật hoạt động',
    'activities.reject': 'Từ chối hoạt động',
    // Registrations
    'registrations.read': 'Xem đăng ký',
    'registrations.write': 'Sửa đăng ký',
    'registrations.delete': 'Xóa đăng ký',
    'registrations.view': 'Xem đăng ký',
    'registrations.register': 'Đăng ký tham gia',
    'registrations.cancel': 'Hủy đăng ký',
    'registrations.approve': 'Duyệt đăng ký',
    'registrations.reject': 'Từ chối đăng ký',
    // Attendance
    'attendance.read': 'Xem điểm danh',
    'attendance.write': 'Điểm danh',
    'attendance.delete': 'Xóa điểm danh',
    'attendance.view': 'Xem điểm danh',
    'attendance.mark': 'Đánh dấu điểm danh',
    // Reports
    'reports.read': 'Xem báo cáo',
    'reports.export': 'Xuất báo cáo',
    'reports.view': 'Xem báo cáo',
    // Roles
    'roles.read': 'Xem vai trò',
    'roles.write': 'Sửa vai trò',
    'roles.delete': 'Xóa vai trò',
    // Notifications
    'notifications.read': 'Xem thông báo',
    'notifications.write': 'Gửi thông báo',
    'notifications.delete': 'Xóa thông báo',
    'notifications.view': 'Xem thông báo',
    'notifications.create': 'Tạo thông báo',
    'notifications.manage': 'Quản lý thông báo',
    // Students
    'students.read': 'Xem sinh viên',
    'students.update': 'Cập nhật sinh viên',
    // Classmates
    'classmates.read': 'Xem bạn cùng lớp',
    'classmates.assist': 'Hỗ trợ bạn cùng lớp',
    // Profile
    'profile.read': 'Xem hồ sơ',
    'profile.update': 'Cập nhật hồ sơ',
    // Scores
    'scores.read': 'Xem điểm',
    'points.view_all': 'Xem tất cả điểm',
    'points.view_own': 'Xem điểm của mình',
    // System
    'system.manage': 'Quản lý hệ thống',
    'system.configure': 'Cấu hình hệ thống',
    'system.dashboard': 'Bảng điều khiển',
    'system.roles': 'Quản lý vai trò',
    'system.settings': 'Cài đặt hệ thống',
    'system.logs': 'Xem nhật ký',
    // Activity Types
    'activityTypes.read': 'Xem loại hoạt động',
    'activityTypes.write': 'Sửa loại hoạt động',
    'activityTypes.delete': 'Xóa loại hoạt động',
  };

  // Hàm lấy label tiếng Việt cho permission
  const getPermissionLabel = (slug) => {
    return PERMISSION_LABELS[slug] || slug;
  };

  // Update state whenever role data changes (important for permission display)
  React.useEffect(() => {
    console.log('?? RolePermissionEditor updating state:', {
      roleId: role?.id,
      roleName: role?.ten_vt,
      permissions: role?.quyen_han
    });
    
    setName(role.ten_vt || '');
    setDesc(role.mo_ta || '');
    setSelected(new Set(Array.isArray(role.quyen_han) ? role.quyen_han : []));
    setSetDirty(false);
  }, [role?.id, JSON.stringify(role?.quyen_han)]);

  const buttonStyle = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: 'white',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14
  };

  const toggle = (perm: string) => {
    const next = new Set<string>(selected);
    
    if (!useCanonical) {
      // In legacy mode, need to handle both legacy and canonical equivalents
      const equivalents = (legacyToCanonical && legacyToCanonical[perm]) ? legacyToCanonical[perm] : [];
      const isCurrentlyActive = next.has(perm) || equivalents.some((q) => next.has(q));
      
      if (isCurrentlyActive) {
        // Remove: delete both legacy permission AND all canonical equivalents
        next.delete(perm);
        equivalents.forEach((q) => next.delete(q));
      } else {
        // Add: just add the legacy permission (will be converted to canonical on save)
        next.add(perm);
      }
    } else {
      // In canonical mode, simple toggle
      if (next.has(perm)) next.delete(perm); else next.add(perm);
    }
    
    setSelected(next);
    setSetDirty(true);
  };

  const save = async () => {
    // Convert selected permissions to canonical format before saving
    const permissionsToSave = new Set<string>();
    
    Array.from(selected).forEach((p: string) => {
      if (useCanonical) {
        // Already canonical
        permissionsToSave.add(p);
      } else {
        // Map legacy to canonical
        const eq = (legacyToCanonical && legacyToCanonical[p]) ? legacyToCanonical[p] : [];
        if (eq.length > 0) {
          eq.forEach((q) => permissionsToSave.add(q));
        } else {
          // If no mapping, keep original
          permissionsToSave.add(p);
        }
      }
    });
    
    const payload = {
      ten_vt: name.trim(),
      mo_ta: desc,
      quyen_han: Array.from(permissionsToSave)
    };
    
    console.log('?? Saving role permissions:', payload);
    
    await onSaved?.(payload);
    setSetDirty(false);
  };

  const reset = () => {
    setName(role.ten_vt || '');
    setDesc(role.mo_ta || '');
    setSelected(new Set(Array.isArray(role.quyen_han) ? role.quyen_han : []));
    setSetDirty(false);
  };

  return (
    <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa', display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Tên vai trò</label>
          <input style={inputStyle} value={name} onChange={(e) => { setName(e.target.value); setSetDirty(true); }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Mô tả</label>
          <input style={inputStyle} value={desc} onChange={(e) => { setDesc(e.target.value); setSetDirty(true); }} />
        </div>
      </div>
      <div style={{ fontWeight: 600 }}>Quyền của vai trò: {role.ten_vt} {useCanonical ? '(slug chuẩn - test)' : ''}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {allPermissions.map((p) => {
          // Show as active if:
          // - canonical mode: exact slug is selected
          // - legacy mode: either the legacy slug is selected OR any of its canonical equivalents are selected
          let active = false;
          if (useCanonical) {
            active = selected.has(p);
          } else {
            const equivalents = (legacyToCanonical && legacyToCanonical[p]) ? legacyToCanonical[p] : [];
            active = selected.has(p) || equivalents.some((q) => selected.has(q));
          }
          return (
            <button key={p} onClick={() => toggle(p)}
              title={p}
              style={{ ...buttonStyle, borderColor: active ? '#c7d2fe' : '#e5e7eb', background: active ? '#eef2ff' : 'white', color: active ? '#4338ca' : '#374151' }}>
              {getPermissionLabel(p)}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {useCanonical && typeof onRestoreOriginal === 'function' ? (
          <button onClick={onRestoreOriginal} style={{ ...buttonStyle, background: '#fff7ed', borderColor: '#fdba74', color: '#b45309' }}>Khôi phục quyền gốc</button>
        ) : null}
        <button disabled={!setDirty} onClick={reset} style={{ ...buttonStyle, opacity: setDirty ? 1 : 0.6 }}>Hoàn tác</button>
        <button disabled={!setDirty} onClick={save} style={{ ...buttonStyle, background: setDirty ? '#10b981' : '#d1d5db', color: 'white', borderColor: setDirty ? '#10b981' : '#d1d5db', cursor: setDirty ? 'pointer' : 'not-allowed' }}>Lưu</button>
      </div>
    </div>
  );
}
