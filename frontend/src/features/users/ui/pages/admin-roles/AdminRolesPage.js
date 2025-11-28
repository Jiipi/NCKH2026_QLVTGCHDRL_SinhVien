import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Shield, Users, Plus, Edit, Trash2, Eye, Search, X, Save, Crown, Key, Lock, Clock, CheckCircle, XCircle, Sparkles, MapPin, Calendar } from 'lucide-react';
import http from '../../../../../shared/api/http';
import { extractRolesFromAxiosResponse, extractUsersFromAxiosResponse } from '../../../../../shared/lib/apiNormalization';
import { getUserAvatar, getStudentAvatar } from '../../../../../shared/lib/avatar';
import { userManagementApi } from '../../../../admin/services/userManagementApi';
import Pagination from '../../../../../shared/components/common/Pagination';

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [roleCounts, setRoleCounts] = useState({});
  const [roleFilter, setRoleFilter] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(10);
  const [userTotal, setUserTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  // Test-only: toggle to use canonical backend slugs in UI
  const [useCanonicalSlugs, setUseCanonicalSlugs] = useState(false);
  // Backup original permissions per role to allow restore after testing
  const [permsBackupByRoleId, setPermsBackupByRoleId] = useState({});
  // Removed status filter per request
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  // Active users from sessions (for real-time status display)
  const [activeUserIds, setActiveUserIds] = useState(new Set());

  // Fetch active sessions to determine who is online
  const fetchActiveSessions = useCallback(async () => {
    try {
      const response = await http.get('/core/sessions/active-users?minutes=5');
      const data = response.data?.data;
      if (data) {
        const activeIds = new Set();
        if (Array.isArray(data.userIds)) {
          data.userIds.forEach(id => {
            if (id != null) activeIds.add(String(id));
          });
        }
        if (Array.isArray(data.userCodes)) {
          data.userCodes.forEach(code => {
            if (code) activeIds.add(String(code));
          });
        }
        if (Array.isArray(data.users)) {
          data.users.forEach(user => {
            if (user?.user_id) activeIds.add(String(user.user_id));
            if (user?.ten_dn) activeIds.add(String(user.ten_dn));
            if (user?.mssv) activeIds.add(String(user.mssv));
          });
        }
        setActiveUserIds(activeIds);
      }
    } catch (error) {
      console.error('Lỗi khi tải phiên hoạt động:', error);
    }
  }, []);

  // Get derived status based on session activity (same logic as AdminUsersPage)
  const getDerivedStatus = useCallback((user) => {
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
        const resp = await http.get('/admin/roles');
        const rs = extractRolesFromAxiosResponse(resp);
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
        const resp = await http.get(`/admin/roles/${roleFilter.id}`);
        const data = resp?.data?.data || resp?.data || {};
        if (!Array.isArray(data.quyen_han)) data.quyen_han = [];
        
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

  async function fetchRoleCounts(list) {
    const arr = Array.isArray(list) ? list : roles;
    if (!arr || arr.length === 0) return;
    try {
      const pairs = await Promise.all(
        arr.map(async (r) => {
          try {
            const result = await userManagementApi.fetchUsers({ role: r.ten_vt, page: 1, limit: 1 });
            if (result.success) {
              const total = result.data?.pagination?.total ?? result.data?.total ?? 0;
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

  async function deleteRole(roleId) {
    if (!window.confirm('Bạn có chắc muốn xóa vai trò này?')) return;
    if (!window.confirm('Xóa luôn TẤT CẢ người dùng đang thuộc vai trò này? Hành động này không thể hoàn tác.')) return;
    try {
      await http.delete(`/admin/roles/${roleId}`, { params: { cascadeUsers: true } });
      const rs = extractRolesFromAxiosResponse(await http.get('/admin/roles'));
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
      const result = await userManagementApi.fetchUsers(baseParams);
      
      if (result.success) {
        const data = result.data || {};
        const paginationInfo = data.pagination || {};
        let list = Array.isArray(data.users)
          ? data.users
          : extractUsersFromAxiosResponse({ data });

        if (role && paginationInfo?.totalPages > 1) {
          const extraPages = [];
          for (let nextPage = 2; nextPage <= paginationInfo.totalPages; nextPage++) {
            extraPages.push(
              userManagementApi.fetchUsers({ ...baseParams, page: nextPage })
            );
          }

          const responses = await Promise.all(extraPages);
          responses.forEach((res) => {
            if (res.success) {
              const resData = res.data || {};
              const more = Array.isArray(resData.users)
                ? resData.users
                : extractUsersFromAxiosResponse({ data: resData });
              list = list.concat(more);
            }
          });
          setUsers(list);
          setUserTotal(list.length);
          setUserPage(1);
        } else {
          setUsers(list);
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
    <div style={{ minHeight: '100vh', padding: 24, background: 'linear-gradient(to bottom right, #f0f9ff, white, #faf5ff)' }}>
      
      {/* Ultra Modern Header - Neo-brutalism + Glassmorphism */}
      <div style={{ position: 'relative', minHeight: 280, marginBottom: 24, borderRadius: 24 }}>
        {/* Animated Background Grid */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 24 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, #0d9488, #14b8a6, #0ea5e9)' }}></div>
          <div style={{ 
            position: 'absolute', 
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>

        {/* Floating Geometric Shapes */}
        <div style={{ position: 'absolute', top: 40, right: 80, width: 80, height: 80, border: '4px solid rgba(255,255,255,0.3)', transform: 'rotate(45deg)', animation: 'bounce-slow 3s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: 40, left: 60, width: 60, height: 60, background: 'rgba(251,191,36,0.2)', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '33%', width: 50, height: 50, border: '4px solid rgba(236,72,153,0.4)', borderRadius: '50%', animation: 'spin-slow 8s linear infinite' }}></div>

        {/* Main Content Container with Glassmorphism */}
        <div style={{ position: 'relative', zIndex: 10, padding: 32 }}>
          <div style={{ 
            backdropFilter: 'blur(40px)', 
            background: 'rgba(255,255,255,0.1)', 
            border: '2px solid rgba(255,255,255,0.2)', 
            borderRadius: 16, 
            padding: 32, 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' 
          }}>
            
            {/* Top Bar with Badge */}
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: '#818cf8', filter: 'blur(20px)', opacity: 0.5, animation: 'pulse 2s ease-in-out infinite' }}></div>
                  <div style={{ position: 'relative', background: 'black', color: '#818cf8', padding: '8px 16px', fontWeight: 900, fontSize: 14, letterSpacing: 2, transform: 'rotate(-2deg)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '2px solid #818cf8' }}>
                    ✓ VAI TRÒ
                  </div>
                </div>
                <div style={{ height: 32, width: 4, background: 'rgba(255,255,255,0.4)' }}></div>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, background: '#818cf8', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' }}></div>
                    {roles.length} VAI TRÒ
                  </div>
                </div>
              </div>
            </div>

            {/* Main Title Section */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ 
                fontSize: '4.5rem', 
                fontWeight: 900, 
                color: 'white', 
                marginBottom: 16, 
                lineHeight: 1, 
                letterSpacing: '-0.05em' 
              }}>
                <span style={{ display: 'inline-block', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>Q</span>
                <span style={{ display: 'inline-block', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>U</span>
                <span style={{ display: 'inline-block', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>Ả</span>
                <span style={{ display: 'inline-block', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>N</span>
                <span style={{ display: 'inline-block', margin: '0 8px' }}>•</span>
                <span style={{ display: 'inline-block', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>T</span>
                <span style={{ display: 'inline-block', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>R</span>
                <span style={{ display: 'inline-block', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>Ị</span>
                <br />
                <span style={{ position: 'relative', display: 'inline-block', marginTop: 8 }}>
                  <span style={{ position: 'relative', zIndex: 10, color: '#c7d2fe', filter: 'drop-shadow(0 0 30px rgba(199,210,254,0.5))' }}>
                    VAI TRÒ & QUYỀN
                  </span>
                  <div style={{ position: 'absolute', bottom: -8, left: 0, right: 0, height: 16, background: 'rgba(199,210,254,0.3)', filter: 'blur(4px)' }}></div>
                </span>
              </h1>
              
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20, fontWeight: 500, maxWidth: 700, lineHeight: 1.6 }}>
                Quản lý vai trò, phân quyền và người dùng trong hệ thống
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {roles.map((r, idx) => {
                const colors = [
                  { bg: '#fbbf24', name: 'ADMIN' },
                  { bg: '#60a5fa', name: 'GIẢNG VIÊN' },
                  { bg: '#a78bfa', name: 'LỚP TRƯỞNG' },
                  { bg: '#34d399', name: 'SINH VIÊN' }
                ];
                const color = colors[idx % colors.length];
                return (
                  <div key={r.id} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setRoleFilter(r); setUserPage(1); }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'black', transform: 'translate(8px, 8px)', borderRadius: 12 }}></div>
                    <div style={{ 
                      position: 'relative', 
                      background: color.bg, 
                      border: '4px solid black', 
                      padding: 16, 
                      borderRadius: 12, 
                      transform: roleFilter?.id === r.id ? 'translate(-4px, -4px)' : 'translate(0, 0)',
                      transition: 'transform 0.3s' 
                    }}>
                      {getRoleIcon(r.ten_vt)}
                      <p style={{ fontSize: 28, fontWeight: 900, color: 'black', margin: '8px 0 4px 0' }}>{roleCounts[r.id] ?? 0}</p>
                      <p style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>{r.ten_vt}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>

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
          role={useCanonicalSlugs ? { ...roleFilter, quyen_han: Array.from(toCanonicalSet(roleFilter.quyen_han)) } : roleFilter}
          allPermissions={useCanonicalSlugs ? CANONICAL_PERMISSION_SLUGS : LEGACY_PERMISSION_SLUGS}
          useCanonical={useCanonicalSlugs}
          legacyToCanonical={LEGACY_TO_CANONICAL}
          onRestoreOriginal={useCanonicalSlugs && permsBackupByRoleId[roleFilter.id]?.length ? async () => {
            try {
              const orig = permsBackupByRoleId[roleFilter.id] || [];
              await http.put(`/admin/roles/${roleFilter.id}`, { ten_vt: roleFilter.ten_vt, mo_ta: roleFilter.mo_ta, quyen_han: orig });
              const rs = extractRolesFromAxiosResponse(await http.get('/admin/roles'));
              setRoles(rs);
              const cur = rs.find(r => r.id === roleFilter.id) || rs[0] || null;
              setRoleFilter(cur);
              fetchRoleCounts(rs);
            } catch (e) {
              console.error('Khôi phục quyền cũ thất bại', e.response?.data || e.message);
            }
          } : null}
          onSaved={async (updated) => {
            try {
              console.log('?? Updating role permissions via API:', updated);
              
              await http.put(`/admin/roles/${roleFilter.id}`, {
                ten_vt: updated.ten_vt,
                mo_ta: updated.mo_ta,
                quyen_han: updated.quyen_han,
              });
              
              console.log('? Role permissions saved successfully');
              
              // Refresh roles list
              const rs = extractRolesFromAxiosResponse(await http.get('/admin/roles'));
              setRoles(rs);
              
              // Reload the current role with fresh data from API
              const freshResp = await http.get(`/admin/roles/${roleFilter.id}`);
              const freshData = freshResp?.data?.data || freshResp?.data || {};
              if (!Array.isArray(freshData.quyen_han)) freshData.quyen_han = [];
              
              console.log('?? Reloaded role after save:', {
                roleId: freshData.id,
                permissions: freshData.quyen_han
              });
              
              setRoleFilter({ ...freshData });
              fetchRoleCounts(rs);
            } catch (e) {
              console.error('❌ Cập nhật quyền vai trò thất bại:', e.response?.data || e.message);
              alert('Cập nhật quyền vai trò thất bại: ' + (e.response?.data?.message || e.message));
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
                          e.target.style.display = 'none'; 
                          e.target.nextSibling.style.display = 'flex'; 
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
                      {u.ho_ten || u.hoten || ''}
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
                      {u.maso || u.ten_dn || ''}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{ fontSize: 13, color: '#4b5563', fontWeight: 500 }}>
                  {u.email || '—'}
                </div>

                {/* Dynamic Columns */}
                {isStudent ? (
                  <>
                    <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{u.lop || '—'}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{u.khoa || '—'}</div>
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
                      <Key size={12} /> {u.quyen_count ?? 0}
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{u.so_hd_tao ?? 0}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{u.so_lop_cn ?? 0}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{u.so_hd_tao ?? 0}</div>
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

function RolePermissionEditor({ role, allPermissions, onSaved, useCanonical, onRestoreOriginal, legacyToCanonical }) {
  const [name, setName] = React.useState(role.ten_vt || '');
  const [desc, setDesc] = React.useState(role.mo_ta || '');
  const [setDirty, setSetDirty] = React.useState(false);
  const [selected, setSelected] = React.useState(Array.isArray(role.quyen_han) ? new Set(role.quyen_han) : new Set());

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

  const toggle = (perm) => {
    const next = new Set(selected);
    
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
    const permissionsToSave = new Set();
    
    Array.from(selected).forEach((p) => {
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
              style={{ ...buttonStyle, borderColor: active ? '#c7d2fe' : '#e5e7eb', background: active ? '#eef2ff' : 'white', color: active ? '#4338ca' : '#374151' }}>
              {p}
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
