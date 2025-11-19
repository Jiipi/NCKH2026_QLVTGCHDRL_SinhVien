import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, Search, Plus, Edit, Trash2, Eye, Filter, X,
  User, Mail, Calendar, Award, CheckCircle, XCircle,
  Phone, MapPin, GraduationCap, Star, Settings, Save,
  UserPlus, Activity, Clock, Target, Heart, Shield,
  LayoutGrid, Sparkles
} from 'lucide-react';
import http from '../../../shared/api/http';
import { extractUsersFromAxiosResponse, extractRolesFromAxiosResponse } from '../../../shared/lib/apiNormalization';
import { getUserAvatar, getStudentAvatar } from '../../../shared/lib/avatar';
import Pagination from '../../../shared/components/common/Pagination';

const DEFAULT_PAGE_LIMIT = 20;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: DEFAULT_PAGE_LIMIT, total: 0, totalPages: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [userPoints, setUserPoints] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [createRoleTab, setCreateRoleTab] = useState('Admin');
  const [classes, setClasses] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    byRole: { ADMIN: 0, GIANG_VIEN: 0, LOP_TRUONG: 0, SINH_VIEN: 0 },
    active: 0,
    inactive: 0,
    locked: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [realTimeSessions, setRealTimeSessions] = useState(0);
  const [activeUserIds, setActiveUserIds] = useState(new Set());
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);

  const normalizeUserRecord = useCallback((user = {}) => {
    if (!user) return null;
    const roleField = typeof user.vai_tro === 'string'
      ? { ten_vt: user.vai_tro }
      : (user.vai_tro || null);
    const roleName = user.role || roleField?.ten_vt || '';
    const matchedRole = roles.find(r => r.id === user.vai_tro_id || r.ten_vt === roleName);
    const resolvedRole = matchedRole
      ? { id: matchedRole.id, ten_vt: matchedRole.ten_vt }
      : roleField;
    let student = null;
    if (user.sinh_vien) {
      student = {
        ...user.sinh_vien,
        lop_id: user.sinh_vien.lop_id || user.sinh_vien.lop?.id || user.lop_id || null
      };
    }

    return {
      ...user,
      role: roleName || matchedRole?.ten_vt || resolvedRole?.ten_vt || '',
      vai_tro: resolvedRole || null,
      vai_tro_id: user.vai_tro_id || matchedRole?.id || resolvedRole?.id || null,
      sinh_vien: student
    };
  }, [roles]);

  const fetchRealTimeSessions = useCallback(async () => {
    try {
      const response = await http.get('/core/sessions/active-users?minutes=5');
      const data = response.data?.data;
      if (data) {
        const sessionCount = data.sessionCount ?? data.userIds?.length ?? 0;
        setRealTimeSessions(sessionCount);

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
        const uniqueActiveUsers = Array.isArray(data.userIds)
          ? data.userIds.length
          : (Array.isArray(data.users) ? new Set(data.users.map(u => u.user_id)).size : sessionCount);
        setActiveUsersCount(uniqueActiveUsers || 0);
      }
    } catch (error) {
      console.error('Lỗi khi tải phiên hoạt động:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchUserStats();
    fetchRealTimeSessions();
    
    // Refresh real-time sessions every 5 seconds for near real-time updates
    const interval = setInterval(() => {
      fetchRealTimeSessions();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchRealTimeSessions]);

  useEffect(() => {
    const syncHandler = () => fetchRealTimeSessions();
    window.addEventListener('tab_session_sync', syncHandler);
    window.addEventListener('focus', syncHandler);
    document.addEventListener('visibilitychange', syncHandler);
    return () => {
      window.removeEventListener('tab_session_sync', syncHandler);
      window.removeEventListener('focus', syncHandler);
      document.removeEventListener('visibilitychange', syncHandler);
    };
  }, [fetchRealTimeSessions]);

  useEffect(() => {
    fetchUsers(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    if (searchTerm !== '' || roleFilter !== '') {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchUsers(1, pagination.limit);
    }
  }, [searchTerm, roleFilter]);

  const fetchUsers = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      const response = await http.get(`/admin/users?${params.toString()}`);
      const data = response.data?.data || response.data;
      if (data.users && data.pagination) {
        setUsers(data.users);
        setPagination(prev => ({
          ...prev,
          page: data.pagination.page || page,
          limit: data.pagination.limit || limit,
          total: data.pagination.total ?? data.users.length ?? prev.total,
          totalPages: data.pagination.totalPages ?? (Math.ceil((data.pagination.total ?? data.users.length ?? 0) / (data.pagination.limit || limit)) || 1)
        }));
      } else {
        const normalized = extractUsersFromAxiosResponse(response);
        setUsers(normalized);
        setPagination(prev => ({
          ...prev,
          page,
          limit,
          total: normalized.length,
          totalPages: Math.ceil(normalized.length / limit) || 1
        }));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await http.get('/admin/roles');
      const list = extractRolesFromAxiosResponse(response);
      setRoles(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách vai trò:', error);
      setRoles([]);
    }
  };
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await http.get('/admin/classes');
        const data = res.data?.data || res.data || [];
        setClasses(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('Không thể tải danh sách lớp', e);
        setClasses([]);
      }
    };
    loadClasses();
  }, []);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      const res = await http.get('/core/users/stats');
      const data = res.data?.data || res.data || {};
      setUserStats({
        total: data.total || 0,
        byRole: {
          ADMIN: data.byRole?.ADMIN || 0,
          GIANG_VIEN: data.byRole?.GIANG_VIEN || 0,
          LOP_TRUONG: data.byRole?.LOP_TRUONG || 0,
          SINH_VIEN: data.byRole?.SINH_VIEN || 0,
        },
        active: data.active || 0,
        inactive: data.inactive ?? Math.max((data.total || 0) - (data.active || 0), 0),
        locked: data.locked ?? data.inactive ?? Math.max((data.total || 0) - (data.active || 0), 0)
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    const response = await http.get(`/admin/users/${userId}`);
    const userData = response.data?.data || response.data;
    if (userData?.sinh_vien) {
      const pointsResponse = await http.get(`/admin/users/${userId}/points`);
      const pr = pointsResponse.data?.data || pointsResponse.data;
      let pointsArray = [];
      if (Array.isArray(pr)) {
        pointsArray = pr;
      } else if (Array.isArray(pr?.details)) {
        pointsArray = pr.details.map(d => ({
          activity_name: d.name || d.activity || 'Hoạt động',
          date: d.date,
          points: d.points || 0,
          raw: d
        }));
      } else if (Array.isArray(pr?.attendance)) {
        pointsArray = pr.attendance.map(a => ({
          activity_name: a.activity || 'Điểm danh',
          date: a.date,
          points: a.points || 0,
          raw: a
        }));
      }
      setUserPoints(pointsArray);
    } else {
      setUserPoints([]);
    }
    return userData;
  };

  const handleViewDetails = async (user) => {
    const baseUser = normalizeUserRecord(user) || user;
    setSelectedUser(baseUser || null);
    setUserPoints([]);
    setShowDetailModal(true);
    setEditMode(false);
    setDetailLoading(true);
    try {
      const detailData = await fetchUserDetails(user.id);
      const merged = normalizeUserRecord({ ...baseUser, ...detailData });
      setSelectedUser(merged);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết người dùng:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveUser = async () => {
    setFormError('');
    setSubmitLoading(true);
    try {
      if (selectedUser.id) {
        const payload = {};
        if (selectedUser.ten_dn && selectedUser.ten_dn.trim()) payload.maso = selectedUser.ten_dn.trim();
        if (selectedUser.ho_ten && selectedUser.ho_ten.trim()) payload.hoten = selectedUser.ho_ten.trim();
        if (selectedUser.email && selectedUser.email.trim()) payload.email = selectedUser.email.trim();
        if (selectedUser.mat_khau && String(selectedUser.mat_khau).length >= 6) payload.password = selectedUser.mat_khau;
        if (selectedUser.trang_thai) payload.trang_thai = selectedUser.trang_thai;
        const roleName = selectedUser.role || selectedUser.vai_tro?.ten_vt;
        if (roleName) payload.role = roleName;
        if (selectedUser.sinh_vien) {
          payload.student = {
            mssv: selectedUser.sinh_vien.mssv?.trim(),
            ngay_sinh: selectedUser.sinh_vien.ngay_sinh || null,
            gt: selectedUser.sinh_vien.gt || null,
            dia_chi: selectedUser.sinh_vien.dia_chi || null,
            sdt: selectedUser.sinh_vien.sdt || null,
            lop_id: selectedUser.sinh_vien.lop_id || selectedUser.sinh_vien.lop?.id || null
          };
        }
        await http.put(`/admin/users/${selectedUser.id}`, payload);
      } else {
        const maso = (selectedUser.ten_dn || '').trim();
        const hoten = (selectedUser.ho_ten || '').trim();
        const email = (selectedUser.email || '').trim();
        const password = selectedUser.mat_khau || '';
        if (!maso || maso.length < 3) throw new Error('Mã số phải có ít nhất 3 ký tự');
        if (!hoten || hoten.length < 2) throw new Error('Họ tên phải có ít nhất 2 ký tự');
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Email không hợp lệ');
        if (!email.endsWith('@dlu.edu.vn')) throw new Error('Email phải có domain @dlu.edu.vn');
        if (!password || String(password).length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');

        const role = selectedUser.role || createRoleTab || 'Admin';
        const payload = { maso, hoten, email, password, role };
        if (selectedUser.khoa) payload.khoa = selectedUser.khoa;
        if (selectedUser.lop) payload.lop = selectedUser.lop;
        if (selectedUser.sdt) payload.sdt = selectedUser.sdt;

        if (role === 'Sinh viên' || role === 'Lớp trưởng') {
          const mssv = (selectedUser.mssv || '').trim();
          const lop_id = selectedUser.lop_id || '';
          if (!mssv) throw new Error('Vui lòng nhập MSSV');
          if (!lop_id) throw new Error('Vui lòng chọn lớp');
          payload.mssv = mssv;
          payload.lop_id = lop_id;
          if (selectedUser.ngay_sinh) payload.ngay_sinh = selectedUser.ngay_sinh;
          if (selectedUser.gt) payload.gt = selectedUser.gt;
          if (selectedUser.dia_chi) payload.dia_chi = selectedUser.dia_chi;
          if (selectedUser.sdt) payload.sdt = selectedUser.sdt;
          if (role === 'Lớp trưởng' && selectedUser.set_lop_truong) payload.set_lop_truong = true;
        }

        await http.post('/admin/users', payload);
      }
      await fetchUsers();
      await fetchUserStats();
      setShowDetailModal(false);
      setShowCreateModal(false);
      setSelectedUser(null);
      setEditMode(false);
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
      const serverMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.message;
      setFormError(serverMsg || 'Đã xảy ra lỗi khi lưu.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRoleSelect = (roleId) => {
    if (!editMode) return;
    const selectedRole = roles.find(r => String(r.id) === String(roleId));
    setSelectedUser(prev => ({
      ...prev,
      vai_tro_id: roleId,
      role: selectedRole?.ten_vt || prev?.role || '',
      vai_tro: selectedRole ? { id: selectedRole.id, ten_vt: selectedRole.ten_vt } : prev?.vai_tro || null
    }));
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.ho_ten || user?.hoten || 'người dùng này';
    const userRole = user?.vai_tro?.ten_vt || user?.role || '';
    const confirmMessage = `⚠️ CẢNH BÁO: Hành động này không thể hoàn tác!\n\n` +
      `Bạn đang xóa: ${userName} (${userRole})\n\n` +
      `Toàn bộ dữ liệu sau sẽ bị XÓA VĨNH VIỄN:\n` +
      `✗ Thông tin tài khoản\n` +
      `✗ Đăng ký hoạt động\n` +
      `✗ Lịch sử điểm danh\n` +
      `✗ Điểm rèn luyện\n` +
      `✗ Thông báo\n` +
      `✗ Các dữ liệu liên quan khác\n\n` +
      `Bạn có CHẮC CHẮN muốn tiếp tục?`;
    if (!window.confirm(confirmMessage)) return;
    const finalConfirm = window.confirm(
      `XÁC NHẬN LẦN CUỐI:\n\n` +
      `Xóa ${userName}?\n\n` +
      `Nhấn OK để XÓA VĨNH VIỄN.`
    );
    if (!finalConfirm) return;
    try {
      await http.delete(`/admin/users/${userId}`);
      alert(`✓ Đã xóa ${userName} và toàn bộ dữ liệu liên quan khỏi hệ thống.`);
      await fetchUsers();
      await fetchUserStats();
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể xóa người dùng';
      alert(`✗ LỖI: ${errorMessage}`);
    }
  };

  // Removed: getActiveAccountIdentifiers - now using activeUserIds from session API

  const allUsers = Array.isArray(users) ? users : [];
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const needle = searchTerm.toLowerCase();
    const matchesSearch = !needle ||
      user.ho_ten?.toLowerCase().includes(needle) ||
      user.ten_dn?.toLowerCase().includes(needle) ||
      user.email?.toLowerCase().includes(needle) ||
      user.sinh_vien?.mssv?.toLowerCase().includes(needle);
    
    // Check if user is currently active (has active session)
    const isActiveNow = activeUserIds.has(String(user.id)) || 
                        activeUserIds.has(String(user.ten_dn)) ||
                        (user.sinh_vien?.mssv && activeUserIds.has(String(user.sinh_vien.mssv)));
    
    const locked = user.trang_thai === 'khoa' || user.khoa === true;
    const derivedStatus = locked ? 'khoa' : (isActiveNow ? 'hoat_dong' : 'khong_hoat_dong');
    
    const matchesRole = !roleFilter || user.vai_tro?.ten_vt === roleFilter;
    const matchesStatus = !statusFilter || derivedStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'hoat_dong': return { bg: '#dcfce7', color: '#15803d', text: 'Hoạt động' };
      case 'khong_hoat_dong': return { bg: '#f3f4f6', color: '#374151', text: 'Không hoạt động' };
      case 'khoa': return { bg: '#fef2f2', color: '#dc2626', text: 'Bị khóa' };
      default: return { bg: '#fef3c7', color: '#92400e', text: 'Chưa xác định' };
    }
  };

  const openCreateModal = () => {
    const defaultRole = roles?.[0]?.ten_vt || 'Admin';
    setSelectedUser({
      ten_dn: '',
      email: '',
      ho_ten: '',
      role: defaultRole,
      sinh_vien: null
    });
    setCreateRoleTab(defaultRole);
    setShowCreateModal(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return { bg: '#fef2f2', color: '#dc2626' };
      case 'Giảng viên': return { bg: '#fef3c7', color: '#92400e' };
      case 'Lớp trưởng': return { bg: '#dbeafe', color: '#1e40af' };
      case 'Sinh viên': return { bg: '#dcfce7', color: '#15803d' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const normalizeRoleKey = (role) => (role || '').toString().toUpperCase().replace(/\s+/g, '_');
  const totalAccounts = userStats.total || pagination.total || allUsers.length || 0;
  const adminCount = userStats.byRole?.ADMIN || 0;
  const teacherCount = userStats.byRole?.GIANG_VIEN || 0;
  const studentCount = userStats.byRole?.SINH_VIEN || 0;
  const lockedAccounts = userStats.locked ?? Math.max(totalAccounts - (userStats.active || 0), 0);
  const liveSessions = realTimeSessions;
  const activeNowCount = Math.min(activeUsersCount || 0, totalAccounts);
  const inactiveCount = Math.max(totalAccounts - lockedAccounts - activeNowCount, 0);

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes neo-float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>

      <div className="space-y-6 mb-8">
        <div className="relative min-h-[280px]">
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce"></div>
          <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full"></div>

          <div className="relative z-10 p-6 sm:p-8">
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-50 animate-pulse"></div>
                      <div className="relative bg-black text-indigo-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-indigo-400">
                        🛡️ NEO ADMIN
                      </div>
                    </div>
                    <div className="h-8 w-1 bg-white/40"></div>
                    <div className="text-white/90 font-bold text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse"></div>
                      {totalAccounts} tài khoản
                    </div>
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 shadow-xl hover:shadow-white/50 hover:scale-105 font-bold"
                  >
                    <UserPlus className="h-5 w-5" />
                    Thêm tài khoản
                  </button>
                </div>

                <div>
                  <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                    Quản lý tài khoản
                    <br />
                    <span className="text-pink-200">TẬP TRUNG</span>
                  </h1>
                  <p className="text-white/80 text-lg font-medium max-w-2xl mt-3">
                    Theo dõi hoạt động đăng nhập, trạng thái khóa/kích hoạt và phân bổ vai trò cho toàn bộ hệ thống chỉ trong một màn hình.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Users, label: 'Tổng tài khoản', value: totalAccounts, accent: 'bg-gradient-to-br from-yellow-200 to-yellow-50' },
                    { icon: Clock, label: 'Phiên đang hoạt động', value: liveSessions, accent: 'bg-gradient-to-br from-emerald-200 to-emerald-50' },
                    { icon: Shield, label: 'Tài khoản bị khóa', value: lockedAccounts, accent: 'bg-gradient-to-br from-rose-200 to-rose-50' },
                  { icon: LayoutGrid, label: 'Admin • GV • LT • SV', value: `${adminCount}/${teacherCount}/${userStats.byRole?.LOP_TRUONG || 0}/${studentCount}`, accent: 'bg-gradient-to-br from-sky-200 to-sky-50' }
                  ].map((stat) => (
                    <div key={stat.label} className="group relative">
                      <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-2xl transition-all duration-300 group-hover:translate-x-3 group-hover:translate-y-3"></div>
                      <div className={`relative border-4 border-black ${stat.accent} p-4 rounded-2xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1`}>
                        <stat.icon className="h-6 w-6 text-black mb-2" />
                        <p className="text-3xl font-black text-black">{stat.value}</p>
                        <p className="text-xs font-black text-black/70 uppercase tracking-wider">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes bounce-slow {
              0%, 100% { transform: translateY(0) rotate(45deg); }
              50% { transform: translateY(-20px) rotate(45deg); }
            }
            .animate-bounce {
              animation: bounce-slow 3s ease-in-out infinite;
            }
          `}</style>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
          <div className="p-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 bg-gray-100 border-2 border-gray-200 rounded-2xl px-4 py-2 text-sm font-semibold text-gray-700">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="">Tất cả vai trò</option>
                  {roles.map((role, idx) => (
                    <option key={idx} value={role.ten_vt}>{role.ten_vt}</option>
                  ))}
                </select>
              </div>
              <div className="text-sm font-semibold text-gray-500">
                {filteredUsers.length} tài khoản
              </div>
              <button
                onClick={() => { setSearchTerm(''); setRoleFilter(''); setStatusFilter(''); }}
                className="ml-auto px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
          <div className="px-6 pt-4 text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Trạng thái tài khoản
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: '', label: `Tất cả (${totalAccounts})`, classes: 'bg-gray-100 border-gray-200 text-gray-900', dot: 'bg-gray-600' },
              { key: 'hoat_dong', label: `Hoạt động (${activeNowCount})`, classes: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500' },
              { key: 'khoa', label: `Bị khóa (${lockedAccounts})`, classes: 'bg-rose-50 border-rose-200 text-rose-700', dot: 'bg-rose-500' },
              { key: 'khong_hoat_dong', label: `Không hoạt động (${inactiveCount})`, classes: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-500' }
            ].map((chip) => (
              <button
                key={chip.key || 'all'}
                onClick={() => { setStatusFilter(chip.key); setPagination(prev => ({ ...prev, page: 1 })); }}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold border-2 transition-all hover:-translate-y-0.5 ${chip.classes} ${statusFilter === chip.key ? 'shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-2 ring-offset-2 ring-white/70' : ''}`}
              >
                <span className="text-sm">{chip.label}</span>
                <div className={`w-2 h-2 rounded-full ${chip.dot}`}></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {filteredUsers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#6b7280' }} />
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>
              Không tìm thấy người dùng nào
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const avatarInfo = user.sinh_vien ? getStudentAvatar(user.sinh_vien) : getUserAvatar(user);
            const isActiveNow = activeUserIds.has(String(user.id)) || 
                                activeUserIds.has(String(user.ten_dn)) ||
                                (user.sinh_vien?.mssv && activeUserIds.has(String(user.sinh_vien.mssv)));
            const locked = user.trang_thai === 'khoa' || user.khoa === true;
            const derivedStatus = locked ? 'khoa' : (isActiveNow ? 'hoat_dong' : 'khong_hoat_dong');
            const statusInfo = getStatusColor(derivedStatus);
            const roleInfo = getRoleColor(user.vai_tro?.ten_vt);
            return (
              <div 
                key={user.id}
                style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  {avatarInfo.hasValidAvatar ? (
                    <img 
                      src={avatarInfo.src} 
                      alt={avatarInfo.alt}
                      style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid ' + roleInfo.bg }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; const fallbackEl = e.currentTarget.nextSibling; if (fallbackEl) fallbackEl.style.display = 'flex'; }}
                    />
                  ) : (
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: roleInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleInfo.color, fontWeight: '600', fontSize: '18px' }}>
                      {avatarInfo.fallback}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {user.ho_ten || 'Chưa có tên'}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '500', padding: '2px 8px', borderRadius: '12px', backgroundColor: roleInfo.bg, color: roleInfo.color }}>
                        {user.vai_tro?.ten_vt || 'Chưa xác định'}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '500', padding: '2px 8px', borderRadius: '12px', backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <Mail size={14} />
                    {user.email || 'Chưa có email'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <User size={14} />
                    {user.ten_dn || 'Chưa có username'}
                  </div>
                  {user.sinh_vien && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
                        <GraduationCap size={14} />
                        MSSV: {user.sinh_vien.mssv}
                      </div>
                      {user.sinh_vien.lop && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
                          <Users size={14} />
                          Lớp: {user.sinh_vien.lop.ten_lop}
                        </div>
                      )}
                    </>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <Calendar size={14} />
                    Tham gia: {user.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString('vi-VN') : 'Không xác định'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                  <button 
                    type="button"
                    onClick={() => handleViewDetails(user)}
                    style={{ ...buttonStyle, backgroundColor: '#3b82f6', color: 'white', flex: 1, justifyContent: 'center' }}
                  >
                    <Eye size={16} />
                    Chi tiết
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    style={{ ...buttonStyle, backgroundColor: '#ef4444', color: 'white', padding: '8px 12px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showDetailModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90%', overflow: 'auto', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>
                {editMode ? 'Chỉnh sửa người dùng' : 'Chi tiết người dùng'}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }}>
                    <Edit size={16} />
                    Chỉnh sửa
                  </button>
                ) : (
                  <button onClick={handleSaveUser} style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }}>
                    <Save size={16} />
                    Lưu
                  </button>
                )}
                <button onClick={() => { setShowDetailModal(false); setEditMode(false); setSelectedUser(null); }} style={{ ...buttonStyle, backgroundColor: '#6b7280', color: 'white' }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div style={{ padding: '0 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '0' }}>
              {[
                { id: 'account', label: 'Tài khoản', icon: <User size={16} /> },
                { id: 'personal', label: 'Thông tin cá nhân', icon: <Settings size={16} /> },
                { id: 'points', label: 'Điểm rèn luyện', icon: <Award size={16} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ ...buttonStyle, backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent', color: activeTab === tab.id ? 'white' : '#6b7280', borderRadius: '0', borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent', paddingBottom: '16px', marginBottom: '-1px' }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ padding: '24px' }}>
              {detailLoading && (
                <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>
                  Đang tải dữ liệu chi tiết...
                </div>
              )}
              {activeTab === 'account' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Tên đăng nhập</label>
                    <input type="text" value={selectedUser.ten_dn || ''} onChange={(e) => editMode && setSelectedUser({...selectedUser, ten_dn: e.target.value})} disabled={!editMode} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Email</label>
                    <input type="email" value={selectedUser.email || ''} onChange={(e) => editMode && setSelectedUser({...selectedUser, email: e.target.value})} disabled={!editMode} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Họ tên</label>
                    <input type="text" value={selectedUser.ho_ten || ''} onChange={(e) => editMode && setSelectedUser({...selectedUser, ho_ten: e.target.value})} disabled={!editMode} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Vai trò</label>
                    <select value={selectedUser.vai_tro_id || ''} onChange={(e) => handleRoleSelect(e.target.value)} disabled={!editMode} style={inputStyle}>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.ten_vt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Trạng thái</label>
                    <select value={selectedUser.trang_thai || ''} onChange={(e) => editMode && setSelectedUser({...selectedUser, trang_thai: e.target.value})} disabled={!editMode} style={inputStyle}>
                      <option value="hoat_dong">Hoạt động</option>
                      <option value="khong_hoat_dong">Không hoạt động</option>
                      <option value="khoa">Bị khóa</option>
                    </select>
                  </div>
                </div>
              )}
              {activeTab === 'personal' && selectedUser.sinh_vien && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>MSSV</label>
                    <input type="text" value={selectedUser.sinh_vien.mssv || ''} onChange={(e) => editMode && setSelectedUser({ ...selectedUser, sinh_vien: {...selectedUser.sinh_vien, mssv: e.target.value} })} disabled={!editMode} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Ngày sinh</label>
                    <input type="date" value={selectedUser.sinh_vien.ngay_sinh ? new Date(selectedUser.sinh_vien.ngay_sinh).toISOString().split('T')[0] : ''} onChange={(e) => editMode && setSelectedUser({ ...selectedUser, sinh_vien: {...selectedUser.sinh_vien, ngay_sinh: e.target.value} })} disabled={!editMode} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Giới tính</label>
                    <select value={selectedUser.sinh_vien.gt || ''} onChange={(e) => editMode && setSelectedUser({ ...selectedUser, sinh_vien: {...selectedUser.sinh_vien, gt: e.target.value} })} disabled={!editMode} style={inputStyle}>
                      <option value="">Chọn giới tính</option>
                      <option value="nam">Nam</option>
                      <option value="nu">Nữ</option>
                      <option value="khac">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Số điện thoại</label>
                    <input type="tel" value={selectedUser.sinh_vien.sdt || ''} onChange={(e) => editMode && setSelectedUser({ ...selectedUser, sinh_vien: {...selectedUser.sinh_vien, sdt: e.target.value} })} disabled={!editMode} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Địa chỉ</label>
                    <textarea value={selectedUser.sinh_vien.dia_chi || ''} onChange={(e) => editMode && setSelectedUser({ ...selectedUser, sinh_vien: {...selectedUser.sinh_vien, dia_chi: e.target.value} })} disabled={!editMode} rows={3} style={{...inputStyle, resize: 'vertical'}} />
                  </div>
                </div>
              )}
              {activeTab === 'points' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Điểm Rèn Luyện</h3>
                  {!Array.isArray(userPoints) || userPoints.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Award size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#6b7280' }} />
                      <p style={{ color: '#6b7280' }}>Chưa có điểm rèn luyện</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {userPoints.map((point, index) => (
                        <div key={index} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                              {point.activity_name || 'Hoạt động'}
                            </h4>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>
                              {point.date ? new Date(point.date).toLocaleDateString('vi-VN') : 'N/A'}
                            </p>
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: point.points > 0 ? '#10b981' : '#ef4444' }}>
                            {point.points || 0} điểm
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                <UserPlus size={24} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
                Tạo Người Dùng Mới
              </h2>
              <button onClick={() => { setShowCreateModal(false); setSelectedUser(null); }} style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {['Admin','Giảng viên','Lớp trưởng','Sinh viên'].map(tab => (
                  <button key={tab} onClick={() => { setCreateRoleTab(tab); setSelectedUser({ ...selectedUser, role: tab }); }} style={{ ...buttonStyle, padding: '6px 12px', backgroundColor: createRoleTab === tab ? '#2563eb' : '#f3f4f6', color: createRoleTab === tab ? '#fff' : '#374151' }}>
                    {tab}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Tên đăng nhập *</label>
                  <input type="text" value={selectedUser.ten_dn || ''} onChange={(e) => setSelectedUser({ ...selectedUser, ten_dn: e.target.value })} placeholder="Nhập tên đăng nhập" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Họ và tên *</label>
                  <input type="text" value={selectedUser.ho_ten || ''} onChange={(e) => setSelectedUser({ ...selectedUser, ho_ten: e.target.value })} placeholder="Nhập họ và tên" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Email *</label>
                  <input type="email" value={selectedUser.email || ''} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} placeholder="Nhập email" style={inputStyle} />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>Chỉ chấp nhận email @dlu.edu.vn</p>
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Mật khẩu *</label>
                  <input type="password" value={selectedUser.mat_khau || ''} onChange={(e) => setSelectedUser({ ...selectedUser, mat_khau: e.target.value })} placeholder="Nhập mật khẩu" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Vai trò</label>
                  <input type="text" value={createRoleTab} readOnly style={{ ...inputStyle, backgroundColor: '#f9fafb', color: '#6b7280' }} />
                </div>
                {(createRoleTab === 'Sinh viên' || createRoleTab === 'Lớp trưởng') && (
                  <>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>MSSV *</label>
                      <input type="text" value={selectedUser.mssv || ''} onChange={(e) => setSelectedUser({ ...selectedUser, mssv: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Lớp *</label>
                      <select value={selectedUser.lop_id || ''} onChange={(e) => setSelectedUser({ ...selectedUser, lop_id: e.target.value })} style={inputStyle}>
                        <option value="">Chọn lớp</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.ten_lop} - {c.khoa}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Ngày sinh</label>
                      <input type="date" value={selectedUser.ngay_sinh || ''} onChange={(e) => setSelectedUser({ ...selectedUser, ngay_sinh: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Giới tính</label>
                      <select value={selectedUser.gt || ''} onChange={(e) => setSelectedUser({ ...selectedUser, gt: e.target.value })} style={inputStyle}>
                        <option value="">Chọn giới tính</option>
                        <option value="nam">Nam</option>
                        <option value="nu">Nữ</option>
                        <option value="khac">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>SĐT</label>
                      <input type="tel" value={selectedUser.sdt || ''} onChange={(e) => setSelectedUser({ ...selectedUser, sdt: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Địa chỉ</label>
                      <input type="text" value={selectedUser.dia_chi || ''} onChange={(e) => setSelectedUser({ ...selectedUser, dia_chi: e.target.value })} style={inputStyle} />
                    </div>
                    {createRoleTab === 'Lớp trưởng' && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                          <input type="checkbox" checked={!!selectedUser.set_lop_truong} onChange={(e) => setSelectedUser({ ...selectedUser, set_lop_truong: e.target.checked })} />
                          Đặt làm lớp trưởng cho lớp đã chọn
                        </label>
                      </div>
                    )}
                  </>
                )}
                {createRoleTab === 'Giảng viên' && (
                  <>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Khoa</label>
                      <input type="text" value={selectedUser.khoa || ''} onChange={(e) => setSelectedUser({ ...selectedUser, khoa: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>SĐT</label>
                      <input type="tel" value={selectedUser.sdt || ''} onChange={(e) => setSelectedUser({ ...selectedUser, sdt: e.target.value })} style={inputStyle} />
                    </div>
                  </>
                )}
              </div>
              {formError && (
                <div style={{ marginTop: '16px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px' }}>
                  {String(formError)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '24px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => { setShowCreateModal(false); setSelectedUser(null); }} style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }} disabled={submitLoading}>
                <X size={18} />
                Hủy
              </button>
              <button onClick={handleSaveUser} style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }} disabled={submitLoading}>
                <Save size={18} />
                {submitLoading ? 'Đang tạo...' : 'Tạo Người Dùng'}
              </button>
            </div>
          </div>
        </div>
      )}
      {pagination.total > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 mt-8">
          <Pagination
            pagination={{ page: pagination.page, limit: pagination.limit, total: pagination.total || totalAccounts }}
            onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))}
            itemLabel="tài khoản"
            showLimitSelector={true}
          />
        </div>
      )}
    </div>
  );
}
