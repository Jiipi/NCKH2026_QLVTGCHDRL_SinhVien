import { useState, useEffect } from 'react';
import { userManagementApi } from '../services/userManagementApi';
import { extractUsersFromAxiosResponse, extractRolesFromAxiosResponse } from '../../../shared/lib/apiNormalization';
import sessionStorageManager from '../../../shared/api/sessionStorageManager';

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

  // Fetch users on mount and when pagination changes
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchClasses();
  }, []);

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
      const result = await userManagementApi.fetchUsers({
        page,
        limit,
        search: searchTerm,
        role: roleFilter
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
        console.log(`Users loaded: ${data.users?.length || 0}, Page: ${page}/${data.pagination?.totalPages || 1}`);
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
  };

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
    if (userData.ho_ten && userData.ho_ten.trim()) payload.hoten = userData.ho_ten.trim();
    if (userData.email && userData.email.trim()) payload.email = userData.email.trim();
    if (userData.mat_khau && String(userData.mat_khau).length >= 6) payload.password = userData.mat_khau;
    if (userData.vai_tro?.ten_vt === 'ADMIN') payload.role = 'ADMIN';

    const result = await userManagementApi.updateUser(userId, payload);
    if (!result.success) {
      throw new Error(result.error || 'Không thể cập nhật người dùng');
    }
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

  const { ids: activeIds, codes: activeCodes } = getActiveAccountIdentifiers();

  // Filter users based on search and filters
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const needle = searchTerm.toLowerCase();
    const matchesSearch = !needle ||
      user.ho_ten?.toLowerCase().includes(needle) ||
      user.ten_dn?.toLowerCase().includes(needle) ||
      user.email?.toLowerCase().includes(needle) ||
      user.sinh_vien?.mssv?.toLowerCase().includes(needle);

    const sameId = user.id && activeIds.has(String(user.id));
    const sameCode = (user.maso && activeCodes.has(String(user.maso))) ||
      (user.ten_dn && activeCodes.has(String(user.ten_dn))) ||
      (user.sinh_vien?.mssv && activeCodes.has(String(user.sinh_vien.mssv)));
    const locked = user.trang_thai === 'khoa' || user.khoa === true;
    const derivedStatus = locked ? 'khoa' : (sameId || sameCode ? 'hoat_dong' : 'khong_hoat_dong');
    
    const matchesRole = !roleFilter || user.vai_tro?.ten_vt === roleFilter;
    const matchesStatus = !statusFilter || derivedStatus === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
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
    activeIds,
    activeCodes,
    fetchUserDetails,
    createUser,
    updateUser,
    deleteUser,
    lockUser,
    unlockUser,
    fetchUsers
  };
};
