import React, { useState, useEffect, useCallback } from 'react';
import { userManagementApi } from '../../services/userManagementApi';
import { extractUsersFromAxiosResponse, extractRolesFromAxiosResponse } from '../../../../shared/lib/apiNormalization';
import sessionStorageManager from '../../../../shared/api/sessionStorageManager';

/**
 * Custom hook for user management business logic
 */
export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPoints, setUserPoints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    locked: 0,
    roleCounts: { adminCount: 0, teacherCount: 0, classMonitorCount: 0, studentCount: 0 }
  });
  const [activeSessions, setActiveSessions] = useState({
    userIds: [],
    userCodes: [],
    sessionCount: 0
  });

  // Memoize fetchUsers to always use latest filter values
  const fetchUsers = useCallback(async (page, limit) => {
    try {
      setLoading(true);
      const result = await userManagementApi.fetchUsers({
        page: page ?? 1,
        limit: limit ?? 20,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      });
      
      if (result.success) {
        const data = result.data || {};
        if (data.users && data.pagination) {
          setUsers(data.users);
          setPagination(data.pagination);
        } else {
          const normalized = Array.isArray(data) ? data : extractUsersFromAxiosResponse({ data });
          setUsers(normalized);
        }
        console.log(`Users loaded: ${data.users?.length || 0}, Page: ${page ?? 1}/${data.pagination?.totalPages || 1}, Status: ${statusFilter || 'all'}`);
      } else {
        console.error('Lỗi tải người dùng', result);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  // Track previous values
  const prevFiltersRef = React.useRef({ searchTerm, roleFilter, statusFilter });
  const prevPaginationRef = React.useRef({ page: pagination.page, limit: pagination.limit });
  const skipNextPaginationEffect = React.useRef(false);

  // Fetch initial data on mount
  useEffect(() => {
    fetchUsers(1, 20);
    fetchRoles();
    fetchClasses();
    fetchStats();
    fetchActiveSessions();
  }, []);

  // Fetch users when filters change
  useEffect(() => {
    const filtersChanged = 
      prevFiltersRef.current.searchTerm !== searchTerm ||
      prevFiltersRef.current.roleFilter !== roleFilter ||
      prevFiltersRef.current.statusFilter !== statusFilter;
    
    if (filtersChanged) {
      prevFiltersRef.current = { searchTerm, roleFilter, statusFilter };
      skipNextPaginationEffect.current = true;
      setPagination(prev => ({ ...prev, page: 1 }));
      // Fetch with page 1 and current limit
      fetchUsers(1, pagination.limit);
    }
  }, [searchTerm, roleFilter, statusFilter, fetchUsers, pagination.limit]);

  // Fetch users when pagination changes (skip if it was due to filter change)
  useEffect(() => {
    if (skipNextPaginationEffect.current) {
      skipNextPaginationEffect.current = false;
      return;
    }

    const paginationChanged = 
      prevPaginationRef.current.page !== pagination.page ||
      prevPaginationRef.current.limit !== pagination.limit;

    if (paginationChanged) {
      prevPaginationRef.current = { page: pagination.page, limit: pagination.limit };
      fetchUsers(pagination.page, pagination.limit);
    }
  }, [pagination.page, pagination.limit, fetchUsers]);

  const fetchStats = async () => {
    try {
      const result = await userManagementApi.fetchStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const fetchActiveSessions = async (minutes = 5) => {
    try {
      const result = await userManagementApi.fetchActiveSessions({ minutes });
      if (result.success) {
        const data = result.data || {};
        const sessionCount = typeof data.sessionCount === 'number'
          ? data.sessionCount
          : (Array.isArray(data.userIds) ? data.userIds.length : 0);
        setActiveSessions({
          userIds: Array.isArray(data.userIds) ? data.userIds : [],
          userCodes: Array.isArray(data.userCodes) ? data.userCodes : [],
          sessionCount
        });
      }
    } catch (error) {
      console.warn('Error loading active sessions:', error);
      setActiveSessions({
        userIds: [],
        userCodes: [],
        sessionCount: 0
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveSessions();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchRoles = async () => {
    try {
      const result = await userManagementApi.fetchRoles();
      if (result.success) {
        const list = extractRolesFromAxiosResponse({ data: result.data });
        setRoles(Array.isArray(list) ? list : []);
      } else {
        console.error('Lỗi khi tải danh sách vai trò:', result.error);
        setRoles([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách vai trò:', error);
      setRoles([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await userManagementApi.fetchClasses();
      if (result.success) {
        const data = result.data || [];
        setClasses(Array.isArray(data) ? data : []);
      } else {
        console.warn('Không thể tải danh sách lớp', result.error);
        setClasses([]);
      }
    } catch (error) {
      console.warn('Không thể tải danh sách lớp', error);
      setClasses([]);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const result = await userManagementApi.fetchUserDetails(userId);
      if (result.success) {
        const userData = result.data || {};
        setSelectedUser(userData);
        
        // Fetch points if user is student
        if (userData?.sinh_vien) {
          const pointsResult = await userManagementApi.fetchUserPoints(userId);
          if (pointsResult.success) {
            const pointsData = pointsResult.data || {};
            let pointsArray = [];
            
            if (Array.isArray(pointsData)) {
              pointsArray = pointsData;
            } else if (Array.isArray(pointsData?.details)) {
              pointsArray = pointsData.details.map(d => ({
                activity_name: d.name || d.activity || 'Hoạt động',
                date: d.date,
                points: d.points || 0,
                raw: d
              }));
            } else if (Array.isArray(pointsData?.attendance)) {
              pointsArray = pointsData.attendance.map(a => ({
                activity_name: a.activity || 'Điểm danh',
                date: a.date,
                points: a.points || 0,
                raw: a
              }));
            }
            
            setUserPoints(pointsArray);
          }
        }
        
        return userData;
      } else {
        console.error('Lỗi khi tải chi tiết người dùng:', result.error);
        throw new Error(result.error || 'Không thể tải chi tiết người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết người dùng:', error);
      throw error;
    }
  };

  const createUser = async (userData) => {
    // Client-side validation
    const maso = (userData.ten_dn || '').trim();
    const hoten = (userData.ho_ten || '').trim();
    const email = (userData.email || '').trim();
    const password = userData.mat_khau || '';

    if (!maso || maso.length < 3) throw new Error('Mã số phải có ít nhất 3 ký tự');
    if (!hoten || hoten.length < 2) throw new Error('Họ tên phải có ít nhất 2 ký tự');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Email không hợp lệ');
    if (!email.endsWith('@dlu.edu.vn')) throw new Error('Email phải có domain @dlu.edu.vn');
    if (!password || String(password).length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');

    const role = userData.role || 'Admin';
    const payload = { maso, hoten, email, password, role };

    // Optional fields
    if (userData.khoa) payload.khoa = userData.khoa;
    if (userData.lop) payload.lop = userData.lop;
    if (userData.sdt) payload.sdt = userData.sdt;

    // Student-specific fields
    if (role === 'Sinh viên' || role === 'Lớp trưởng') {
      const mssv = (userData.mssv || '').trim();
      const lop_id = userData.lop_id || '';
      if (!mssv) throw new Error('Vui lòng nhập MSSV');
      if (!lop_id) throw new Error('Vui lòng chọn lớp');
      
      payload.mssv = mssv;
      payload.lop_id = lop_id;
      if (userData.ngay_sinh) payload.ngay_sinh = userData.ngay_sinh;
      if (userData.gt) payload.gt = userData.gt;
      if (userData.dia_chi) payload.dia_chi = userData.dia_chi;
      if (userData.sdt) payload.sdt = userData.sdt;
      if (role === 'Lớp trưởng' && userData.set_lop_truong) payload.set_lop_truong = true;
    }

    const result = await userManagementApi.createUser(payload);
    if (!result.success) {
      throw new Error(result.error || 'Không thể tạo người dùng');
    }
    await fetchUsers();
  };

  const updateUser = async (userId, userData) => {
    const payload = {};
    
    // Basic account fields - backend expects: maso, hoten, email, password, trang_thai, role
    if (userData.ten_dn && userData.ten_dn.trim()) payload.maso = userData.ten_dn.trim();
    if (userData.ho_ten && userData.ho_ten.trim()) payload.hoten = userData.ho_ten.trim();
    if (userData.email && userData.email.trim()) payload.email = userData.email.trim();
    if (userData.mat_khau && String(userData.mat_khau).length >= 6) payload.password = userData.mat_khau;
    if (userData.trang_thai) payload.trang_thai = userData.trang_thai;
    
    // Role handling - backend expects: role (string like "Sinh viên", "Admin")
    if (userData.vai_tro?.ten_vt) payload.role = userData.vai_tro.ten_vt;

    // Student-specific fields - backend expects: student object with mssv, ngay_sinh, gt, dia_chi, sdt, lop_id
    if (userData.sinh_vien) {
      const sv = userData.sinh_vien;
      const studentData = {};
      if (sv.mssv) studentData.mssv = sv.mssv;
      if (sv.lop_id) studentData.lop_id = sv.lop_id;
      if (sv.ngay_sinh) studentData.ngay_sinh = sv.ngay_sinh;
      if (sv.gt) studentData.gt = sv.gt;
      if (sv.dia_chi !== undefined) studentData.dia_chi = sv.dia_chi;
      if (sv.sdt) studentData.sdt = sv.sdt;
      
      if (Object.keys(studentData).length > 0) {
        payload.student = studentData;
      }
    }

    console.log('Updating user with payload:', payload);

    const result = await userManagementApi.updateUser(userId, payload);
    if (!result.success) {
      throw new Error(result.error || 'Không thể cập nhật người dùng');
    }
    
    // Refresh user details after update
    await fetchUserDetails(userId);
    await fetchUsers();
  };

  const deleteUser = async (userId) => {
    const result = await userManagementApi.deleteUser(userId);
    if (!result.success) {
      throw new Error(result.error || 'Không thể xóa người dùng');
    }
    await fetchUsers();
  };

  const lockUser = async (userId) => {
    const result = await userManagementApi.lockUser(userId);
    if (!result.success) {
      throw new Error(result.error || 'Không thể khóa tài khoản');
    }
    await fetchUsers();
  };

  const unlockUser = async (userId) => {
    const result = await userManagementApi.unlockUser(userId);
    if (!result.success) {
      throw new Error(result.error || 'Không thể mở khóa tài khoản');
    }
    await fetchUsers();
  };

  // Get active account identifiers from multi-session sources
  const getActiveAccountIdentifiers = () => {
    const ids = new Set();
    const codes = new Set();
    
    try {
      const tabs = sessionStorageManager.getActiveTabs?.() || [];
      const now = Date.now();
      
      tabs.forEach(t => {
        const fresh = typeof t.timeSinceActivity === 'number' 
          ? t.timeSinceActivity < 2 * 60 * 1000 
          : ((now - (t.lastActivity || 0)) < 2 * 60 * 1000);
        
        if (fresh && t.isActive && t.hasSession) {
          if (t.userId) ids.add(String(t.userId));
          if (t.userCode) codes.add(String(t.userCode));
        }
      });
      
      const msRaw = localStorage.getItem('multi_session_data');
      if (msRaw) {
        const ms = JSON.parse(msRaw);
        Object.values(ms || {}).forEach(sess => {
          const hasToken = !!sess?.token;
          const isActive = sess?.isActive === true;
          const last = sess?.lastActivity || sess?.timestamp;
          const fresh = last ? (now - last) < 2 * 60 * 1000 : false;
          
          if (hasToken && isActive && fresh) {
            const u = sess.user || {};
            if (u.id) ids.add(String(u.id));
            if (u.maso) codes.add(String(u.maso));
            if (u.ten_dn) codes.add(String(u.ten_dn));
          }
        });
      }
    } catch (_) {}
    
    return { ids, codes };
  };

  const { ids: localActiveIds, codes: localActiveCodes } = getActiveAccountIdentifiers();
  const serverActiveIds = new Set((activeSessions.userIds || []).map((id) => String(id)));
  const serverActiveCodes = new Set((activeSessions.userCodes || []).map((code) => String(code)));
  const mergedActiveIds = new Set([...localActiveIds, ...serverActiveIds]);
  const mergedActiveCodes = new Set([...localActiveCodes, ...serverActiveCodes]);

  // Filter users based on search and role filters
  // Note: statusFilter is handled by backend, so we don't filter it here
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const needle = searchTerm.toLowerCase();
    const matchesSearch = !needle ||
      user.ho_ten?.toLowerCase().includes(needle) ||
      user.ten_dn?.toLowerCase().includes(needle) ||
      user.email?.toLowerCase().includes(needle) ||
      user.sinh_vien?.mssv?.toLowerCase().includes(needle);
    
    const matchesRole = !roleFilter || user.vai_tro?.ten_vt === roleFilter;
    
    // Status filter is handled by backend API, so we trust the backend results
    // Only apply client-side search and role filters
    
    return matchesSearch && matchesRole;
  }) : [];

  return {
    users,
    filteredUsers,
    roles,
    classes,
    loading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    pagination,
    setPagination,
    selectedUser,
    setSelectedUser,
    userPoints,
    activeIds: mergedActiveIds,
    activeCodes: mergedActiveCodes,
    activeSessionCount: activeSessions.sessionCount || mergedActiveIds.size,
    stats,
    fetchUserDetails,
    createUser,
    updateUser,
    deleteUser,
    lockUser,
    unlockUser,
    fetchUsers
  };
};
