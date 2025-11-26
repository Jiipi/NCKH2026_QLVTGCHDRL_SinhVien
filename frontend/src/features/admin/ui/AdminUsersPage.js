import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, Search, Plus, Edit, Trash2, Eye, Filter, X,
  User, Mail, Calendar, Award, CheckCircle, XCircle,
  Phone, MapPin, GraduationCap, Star, Settings, Save,
  UserPlus, Activity, Clock, Target, Heart, Shield,
  LayoutGrid, Sparkles, Lock, Unlock, Grid3X3, List
} from 'lucide-react';
import http from '../../../shared/api/http';
import { extractUsersFromAxiosResponse, extractRolesFromAxiosResponse } from '../../../shared/lib/apiNormalization';
import { getUserAvatar, getStudentAvatar } from '../../../shared/lib/avatar';
import Pagination from '../../../shared/components/common/Pagination';
import { useNotification } from '../../../shared/contexts/NotificationContext';

const DEFAULT_PAGE_LIMIT = 20;

export default function AdminUsersPage() {
  const { showSuccess, showError, showInfo } = useNotification();
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
    locked: 0,
    online: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [realTimeSessions, setRealTimeSessions] = useState(0);
  const [activeUserIds, setActiveUserIds] = useState(new Set());
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [displayViewMode, setDisplayViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');

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
    const syncHandler = () => {
      fetchRealTimeSessions();
      fetchUserStats(); // Cập nhật stats khi có thay đổi session
    };
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

  // Khi filter theo trạng thái thay đổi, fetch lại users
  // Sử dụng ref để theo dõi thay đổi và tránh trigger khi mount lần đầu
  const prevStatusFilter = React.useRef(statusFilter);
  useEffect(() => {
    // Chỉ fetch khi statusFilter thực sự thay đổi (không phải lần mount đầu tiên)
    if (prevStatusFilter.current !== statusFilter) {
      prevStatusFilter.current = statusFilter;
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchUsers(1, pagination.limit);
    }
  }, [statusFilter]);

  const fetchUsers = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      // Gửi status filter lên backend
      if (statusFilter) params.append('status', statusFilter);
      
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
      
      // Parse byRole từ array sang object
      const byRoleObj = { ADMIN: 0, GIANG_VIEN: 0, LOP_TRUONG: 0, SINH_VIEN: 0 };
      if (Array.isArray(data.byRole)) {
        // Nếu là array từ groupBy, parse từng item
        data.byRole.forEach(item => {
          const roleName = (item.ten_vt || item.role || item.vai_tro || '').toString().trim().toUpperCase();
          const count = item._count || item.count || 0;
          
          if (roleName.includes('ADMIN') || roleName === 'ADMIN') {
            byRoleObj.ADMIN = count;
          } else if (roleName.includes('GIANG_VIEN') || roleName.includes('GIẢNG VIÊN') || roleName.includes('GV')) {
            byRoleObj.GIANG_VIEN = count;
          } else if (roleName.includes('LOP_TRUONG') || roleName.includes('LỚP TRƯỞNG') || roleName.includes('LOP_TRUONG')) {
            byRoleObj.LOP_TRUONG = count;
          } else if (roleName.includes('SINH_VIEN') || roleName.includes('SINH VIÊN') || roleName.includes('SINH_VIEN')) {
            byRoleObj.SINH_VIEN = count;
          }
        });
      } else if (data.byRole && typeof data.byRole === 'object') {
        // Nếu là object, normalize keys
        Object.keys(data.byRole).forEach(key => {
          const normalizedKey = key.toUpperCase().replace(/\s+/g, '_');
          if (normalizedKey.includes('ADMIN')) {
            byRoleObj.ADMIN = data.byRole[key] || 0;
          } else if (normalizedKey.includes('GIANG_VIEN') || normalizedKey.includes('GV')) {
            byRoleObj.GIANG_VIEN = data.byRole[key] || 0;
          } else if (normalizedKey.includes('LOP_TRUONG') || normalizedKey.includes('LOP_TRUONG')) {
            byRoleObj.LOP_TRUONG = data.byRole[key] || 0;
          } else if (normalizedKey.includes('SINH_VIEN')) {
            byRoleObj.SINH_VIEN = data.byRole[key] || 0;
          }
        });
      }
      
      // Nếu không có dữ liệu từ API, fetch tất cả users để tính
      if (byRoleObj.ADMIN === 0 && byRoleObj.GIANG_VIEN === 0 && byRoleObj.LOP_TRUONG === 0 && byRoleObj.SINH_VIEN === 0) {
        try {
          // Fetch tất cả users (limit lớn) để tính stats
          const allUsersRes = await http.get('/admin/users?limit=10000');
          const allUsersData = allUsersRes.data?.data || allUsersRes.data;
          const allUsersList = allUsersData?.users || extractUsersFromAxiosResponse(allUsersRes) || [];
          
          // Tính lại từ danh sách users
          allUsersList.forEach(user => {
            const role = (user.vai_tro?.ten_vt || user.role || '').toString().trim();
            const roleUpper = role.toUpperCase();
            
            if (roleUpper.includes('ADMIN') || roleUpper === 'ADMIN') {
              byRoleObj.ADMIN++;
            } else if (roleUpper.includes('GIANG_VIEN') || roleUpper.includes('GIẢNG VIÊN') || roleUpper.includes('GV')) {
              byRoleObj.GIANG_VIEN++;
            } else if (roleUpper.includes('LOP_TRUONG') || roleUpper.includes('LỚP TRƯỞNG')) {
              byRoleObj.LOP_TRUONG++;
            } else if (roleUpper.includes('SINH_VIEN') || roleUpper.includes('SINH VIÊN')) {
              byRoleObj.SINH_VIEN++;
            }
          });
        } catch (fetchError) {
          console.error('Error fetching all users for stats:', fetchError);
        }
      }
      
      // Parse byStatus từ array sang object
      let lockedCount = 0;
      let activeCount = 0;
      let inactiveCount = 0;
      if (Array.isArray(data.byStatus)) {
        data.byStatus.forEach(item => {
          if (item.trang_thai === 'khoa') {
            lockedCount = item._count || 0;
          } else if (item.trang_thai === 'hoat_dong') {
            activeCount = item._count || 0;
          } else if (item.trang_thai === 'khong_hoat_dong') {
            inactiveCount = item._count || 0;
          }
        });
      }
      
      // Số user online thực sự (có session active trong 5 phút)
      const onlineCount = data.online || 0;
      
      setUserStats({
        total: data.total || 0,
        byRole: byRoleObj,
        active: activeCount,
        inactive: inactiveCount,
        locked: lockedCount,
        online: onlineCount
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
    
    // Lấy điểm rèn luyện cho tất cả user (endpoint sẽ trả về thông báo nếu không phải sinh viên)
    try {
      const pointsResponse = await http.get(`/admin/users/${userId}/points`);
      const pr = pointsResponse.data?.data || pointsResponse.data;
      let pointsArray = [];
      let totalPoints = 0;
      
      if (pr?.details && Array.isArray(pr.details)) {
        pointsArray = pr.details.map(d => ({
          activity_name: d.ten_hd || d.name || d.activity || 'Hoạt động',
          date: d.ngay_bd || d.date,
          points: d.diem_rl || d.points || 0,
          raw: d
        }));
        totalPoints = pr.tong_diem || pr.totalPoints || 0;
      } else if (Array.isArray(pr)) {
        pointsArray = pr.map(d => ({
          activity_name: d.ten_hd || d.name || d.activity || 'Hoạt động',
          date: d.ngay_bd || d.date,
          points: d.diem_rl || d.points || 0,
          raw: d
        }));
      } else if (pr?.message) {
        // User không phải sinh viên
        pointsArray = [];
        totalPoints = 0;
      }
      
      // Kiểm tra nếu user là sinh viên hoặc lớp trưởng nhưng chưa có thông tin sinh viên
      const userRole = userData?.vai_tro?.ten_vt || userData?.role || '';
      const roleLower = userRole.toLowerCase();
      const isStudentRole = roleLower.includes('sinh viên') || 
                           roleLower.includes('lop truong') || 
                           roleLower.includes('lớp trưởng') ||
                           userRole === 'SINH_VIEN' || userRole === 'SINH_VIÊN' ||
                           userRole === 'LOP_TRUONG' || userRole === 'LỚP_TRƯỞNG';
      const hasStudentInfo = userData?.sinh_vien && (userData.sinh_vien.id || userData.sinh_vien.mssv);
      
      // Nếu là role sinh viên/lớp trưởng nhưng chưa có thông tin sinh viên, không hiển thị message lỗi từ backend
      if (isStudentRole && !hasStudentInfo && pr?.message) {
        setUserPoints({ items: [], total: 0, message: null }); // Không set message để tab points có thể hiển thị hướng dẫn
      } else {
        setUserPoints({ items: pointsArray, total: totalPoints, message: pr?.message });
      }
    } catch (error) {
      console.error('Lỗi khi lấy điểm rèn luyện:', error);
      setUserPoints({ items: [], total: 0, message: null });
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
    
    // Hiển thị thông báo đang xử lý
    const isCreating = !selectedUser.id;
    if (isCreating) {
      showInfo('Đang tạo tài khoản mới...', 'Đang xử lý');
    }
    
    try {
      if (selectedUser.id) {
        // Cập nhật người dùng
        const payload = {};
        if (selectedUser.ten_dn && selectedUser.ten_dn.trim()) payload.maso = selectedUser.ten_dn.trim();
        if (selectedUser.ho_ten && selectedUser.ho_ten.trim()) payload.hoten = selectedUser.ho_ten.trim();
        if (selectedUser.email && selectedUser.email.trim()) payload.email = selectedUser.email.trim();
        if (selectedUser.mat_khau && String(selectedUser.mat_khau).length >= 6) payload.password = selectedUser.mat_khau;
        if (selectedUser.trang_thai) payload.trang_thai = selectedUser.trang_thai;
        const roleName = selectedUser.role || selectedUser.vai_tro?.ten_vt;
        if (roleName) payload.role = roleName;
        
        // Gửi thông tin sinh viên nếu có (kể cả khi user chưa có sinh_vien - để backend có thể tạo mới)
        const sinhVienData = selectedUser.sinh_vien || {};
        const hasStudentData = sinhVienData.mssv || sinhVienData.ngay_sinh || sinhVienData.gt || 
                               sinhVienData.dia_chi || sinhVienData.sdt || sinhVienData.lop_id;
        
        if (hasStudentData || selectedUser.sinh_vien) {
          payload.student = {
            mssv: sinhVienData.mssv?.trim() || null,
            ngay_sinh: sinhVienData.ngay_sinh || null,
            gt: sinhVienData.gt || null,
            dia_chi: sinhVienData.dia_chi || null,
            sdt: sinhVienData.sdt || null,
            lop_id: sinhVienData.lop_id || sinhVienData.lop?.id || null
          };
          
          // Nếu có set_lop_truong, thêm vào payload
          if (selectedUser.set_lop_truong) {
            payload.set_lop_truong = true;
          }
        }
        await http.put(`/admin/users/${selectedUser.id}`, payload);
        showSuccess(
          `Đã cập nhật thông tin người dùng ${selectedUser.ho_ten || selectedUser.ten_dn} thành công`,
          'Cập nhật thành công'
        );
      } else {
        // Tạo người dùng mới
        const maso = (selectedUser.ten_dn || '').trim();
        const hoten = (selectedUser.ho_ten || '').trim();
        const email = (selectedUser.email || '').trim();
        const password = selectedUser.mat_khau || '';
        
        // Validation
        if (!maso || maso.length < 3) {
          throw new Error('Mã số phải có ít nhất 3 ký tự');
        }
        if (!hoten || hoten.length < 2) {
          throw new Error('Họ tên phải có ít nhất 2 ký tự');
        }
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          throw new Error('Email không hợp lệ');
        }
        if (!email.endsWith('@dlu.edu.vn')) {
          throw new Error('Email phải có domain @dlu.edu.vn');
        }
        if (!password || String(password).length < 6) {
          throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
        }

        const role = selectedUser.role || createRoleTab || 'Admin';
        const payload = { maso, hoten, email, password, role };
        if (selectedUser.khoa) payload.khoa = selectedUser.khoa;
        if (selectedUser.lop) payload.lop = selectedUser.lop;
        if (selectedUser.sdt) payload.sdt = selectedUser.sdt;

        if (role === 'Sinh viên' || role === 'Lớp trưởng') {
          const mssv = (selectedUser.mssv || '').trim();
          const lop_id = selectedUser.lop_id || '';
          if (!mssv) {
            throw new Error('Vui lòng nhập MSSV');
          }
          if (!lop_id) {
            throw new Error('Vui lòng chọn lớp');
          }
          payload.mssv = mssv;
          payload.lop_id = lop_id;
          if (selectedUser.ngay_sinh) payload.ngay_sinh = selectedUser.ngay_sinh;
          if (selectedUser.gt) payload.gt = selectedUser.gt;
          if (selectedUser.dia_chi) payload.dia_chi = selectedUser.dia_chi;
          if (selectedUser.sdt) payload.sdt = selectedUser.sdt;
          if (role === 'Lớp trưởng' && selectedUser.set_lop_truong) payload.set_lop_truong = true;
        }

        const response = await http.post('/admin/users', payload);
        
        // Thông báo thành công với thông tin chi tiết
        const roleName = role === 'Admin' ? 'Quản trị viên' : 
                        role === 'Giảng viên' ? 'Giảng viên' :
                        role === 'Lớp trưởng' ? 'Lớp trưởng' : 'Sinh viên';
        const successMessage = `Đã tạo tài khoản ${roleName} "${hoten}" (${maso}) thành công`;
        showSuccess(successMessage, 'Tạo tài khoản thành công');
      }
      
      // Refresh dữ liệu
      await fetchUsers();
      await fetchUserStats();
      
      // Đóng modal
      setShowDetailModal(false);
      setShowCreateModal(false);
      setSelectedUser(null);
      setEditMode(false);
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
      
      // Xử lý thông báo lỗi chi tiết
      let errorMessage = 'Đã xảy ra lỗi khi lưu thông tin người dùng';
      let errorTitle = 'Lỗi';
      
      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || data.msg || data.error || errorMessage;
        
        // Xử lý các loại lỗi cụ thể
        if (error.response.status === 409) {
          errorTitle = 'Tài khoản đã tồn tại';
        } else if (error.response.status === 400) {
          errorTitle = 'Dữ liệu không hợp lệ';
        } else if (error.response.status === 500) {
          errorTitle = 'Lỗi hệ thống';
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage, errorTitle);
      setFormError(errorMessage);
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

  const handleLockUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.ho_ten || user?.hoten || 'người dùng này';
    const confirmMessage = `🔒 Bạn có chắc muốn KHÓA tài khoản của ${userName}?\n\n` +
      `Sau khi khóa:\n` +
      `• Người dùng không thể đăng nhập\n` +
      `• Dữ liệu vẫn được giữ nguyên\n` +
      `• Bạn có thể mở khóa bất cứ lúc nào`;
    if (!window.confirm(confirmMessage)) return;
    
    try {
      await http.patch(`/admin/users/${userId}/lock`);
      alert(`✓ Đã khóa tài khoản ${userName}`);
      await fetchUsers();
      await fetchUserStats();
    } catch (error) {
      console.error('Lỗi khi khóa người dùng:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể khóa tài khoản';
      alert(`✗ LỖI: ${errorMessage}`);
    }
  };

  const handleUnlockUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.ho_ten || user?.hoten || 'người dùng này';
    const confirmMessage = `🔓 Bạn có chắc muốn MỞ KHÓA tài khoản của ${userName}?\n\n` +
      `Sau khi mở khóa:\n` +
      `• Người dùng có thể đăng nhập bình thường`;
    if (!window.confirm(confirmMessage)) return;
    
    try {
      await http.patch(`/admin/users/${userId}/unlock`);
      alert(`✓ Đã mở khóa tài khoản ${userName}`);
      await fetchUsers();
      await fetchUserStats();
    } catch (error) {
      console.error('Lỗi khi mở khóa người dùng:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể mở khóa tài khoản';
      alert(`✗ LỖI: ${errorMessage}`);
    }
  };

  // Removed: getActiveAccountIdentifiers - now using activeUserIds from session API

  const allUsers = Array.isArray(users) ? users : [];
  
  // Khi có statusFilter, backend đã filter sẵn nên chỉ cần filter client-side cho search và role
  // Khi không có statusFilter, filter client-side để hiển thị đúng trạng thái derived
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const needle = searchTerm.toLowerCase();
    const matchesSearch = !needle ||
      user.ho_ten?.toLowerCase().includes(needle) ||
      user.ten_dn?.toLowerCase().includes(needle) ||
      user.email?.toLowerCase().includes(needle) ||
      user.sinh_vien?.mssv?.toLowerCase().includes(needle);
    
    const matchesRole = !roleFilter || user.vai_tro?.ten_vt === roleFilter;
    
    // Nếu đã có statusFilter, backend đã filter rồi - chỉ cần filter search và role
    if (statusFilter) {
      return matchesSearch && matchesRole;
    }
    
    // Nếu không có statusFilter, không cần filter thêm
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest': {
        const ta = new Date(a.ngay_tao || a.created_at || a.createdAt || 0).getTime();
        const tb = new Date(b.ngay_tao || b.created_at || b.createdAt || 0).getTime();
        return ta - tb;
      }
      case 'name-az': {
        const nameA = (a.ho_ten || a.ten_dn || '').toLowerCase();
        const nameB = (b.ho_ten || b.ten_dn || '').toLowerCase();
        return nameA.localeCompare(nameB, 'vi');
      }
      case 'name-za': {
        const nameA = (a.ho_ten || a.ten_dn || '').toLowerCase();
        const nameB = (b.ho_ten || b.ten_dn || '').toLowerCase();
        return nameB.localeCompare(nameA, 'vi');
      }
      case 'newest':
      default: {
        const ta = new Date(a.ngay_tao || a.created_at || a.createdAt || 0).getTime();
        const tb = new Date(b.ngay_tao || b.created_at || b.createdAt || 0).getTime();
        return tb - ta;
      }
    }
  }) : [];

  // Hàm để lấy derived status cho mỗi user (dùng cho hiển thị)
  const getDerivedStatus = (user) => {
    const locked = user.trang_thai === 'khoa' || user.khoa === true;
    if (locked) return 'khoa';
    
    const isActiveNow = activeUserIds.has(String(user.id)) || 
                        activeUserIds.has(String(user.ten_dn)) ||
                        (user.sinh_vien?.mssv && activeUserIds.has(String(user.sinh_vien.mssv)));
    return isActiveNow ? 'hoat_dong' : 'khong_hoat_dong';
  };

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
    // Normalize role name để so sánh
    const normalizedRole = (role || '').toString().trim();
    const roleLower = normalizedRole.toLowerCase();
    
    // Kiểm tra các biến thể của role
    if (roleLower.includes('admin') || normalizedRole === 'ADMIN' || normalizedRole === 'Admin') {
      return { bg: '#fef2f2', color: '#dc2626' };
    }
    if (roleLower.includes('giảng viên') || roleLower.includes('gv') || normalizedRole === 'GIANG_VIEN' || normalizedRole === 'Giảng viên') {
      return { bg: '#fef3c7', color: '#92400e' };
    }
    if (roleLower.includes('lớp trưởng') || roleLower.includes('lop truong') || normalizedRole === 'LOP_TRUONG' || normalizedRole === 'LỚP_TRƯỞNG' || normalizedRole === 'Lớp trưởng') {
      return { bg: '#dbeafe', color: '#1e40af' };
    }
    if (roleLower.includes('sinh viên') || roleLower.includes('sinh vien') || normalizedRole === 'SINH_VIEN' || normalizedRole === 'SINH_VIÊN' || normalizedRole === 'Sinh viên') {
      return { bg: '#dcfce7', color: '#15803d' };
    }
    return { bg: '#f3f4f6', color: '#374151' };
  };
  
  const getDisplayRoleName = (role) => {
    const normalizedRole = (role || '').toString().trim();
    const roleLower = normalizedRole.toLowerCase();
    
    if (roleLower.includes('admin') || normalizedRole === 'ADMIN') return 'Admin';
    if (roleLower.includes('giảng viên') || roleLower.includes('gv') || normalizedRole === 'GIANG_VIEN') return 'Giảng viên';
    if (roleLower.includes('lớp trưởng') || roleLower.includes('lop truong') || normalizedRole === 'LOP_TRUONG' || normalizedRole === 'LỚP_TRƯỞNG') return 'Lớp trưởng';
    if (roleLower.includes('sinh viên') || roleLower.includes('sinh vien') || normalizedRole === 'SINH_VIEN' || normalizedRole === 'SINH_VIÊN') return 'Sinh viên';
    return normalizedRole || 'Chưa xác định';
  };

  const normalizeRoleKey = (role) => (role || '').toString().toUpperCase().replace(/\s+/g, '_');
  const totalAccounts = userStats.total || pagination.total || allUsers.length || 0;
  
  // Tính số lượng user theo role từ userStats (từ API) hoặc từ danh sách users
  const getRoleCounts = () => {
    // Ưu tiên dùng userStats từ API (tổng số user trong hệ thống)
    if (userStats.byRole && typeof userStats.byRole === 'object') {
      // Normalize keys từ userStats
      const stats = userStats.byRole;
      return {
        adminCount: stats.ADMIN || stats.Admin || stats.admin || 0,
        teacherCount: stats.GIANG_VIEN || stats['Giảng viên'] || stats.giang_vien || 0,
        classMonitorCount: stats.LOP_TRUONG || stats.LỚP_TRƯỞNG || stats['Lớp trưởng'] || stats.lop_truong || 0,
        studentCount: stats.SINH_VIEN || stats.SINH_VIÊN || stats['Sinh viên'] || stats.sinh_vien || 0
      };
    }
    
    // Nếu không có stats, tính từ danh sách users hiện có (fallback)
    let adminCount = 0;
    let teacherCount = 0;
    let classMonitorCount = 0;
    let studentCount = 0;
    
    allUsers.forEach(user => {
      const role = (user.vai_tro?.ten_vt || user.role || '').toString().trim();
      const roleLower = role.toLowerCase();
      
      if (roleLower.includes('admin') || role === 'ADMIN' || role === 'Admin') {
        adminCount++;
      } else if (roleLower.includes('giảng viên') || roleLower.includes('gv') || role === 'GIANG_VIEN' || role === 'Giảng viên') {
        teacherCount++;
      } else if (roleLower.includes('lớp trưởng') || roleLower.includes('lop truong') || role === 'LOP_TRUONG' || role === 'LỚP_TRƯỞNG' || role === 'Lớp trưởng') {
        classMonitorCount++;
      } else if (roleLower.includes('sinh viên') || roleLower.includes('sinh vien') || role === 'SINH_VIEN' || role === 'SINH_VIÊN' || role === 'Sinh viên') {
        studentCount++;
      }
    });
    
    return { adminCount, teacherCount, classMonitorCount, studentCount };
  };
  
  const roleCounts = getRoleCounts();
  const adminCount = roleCounts.adminCount;
  const teacherCount = roleCounts.teacherCount;
  const classMonitorCount = roleCounts.classMonitorCount;
  const studentCount = roleCounts.studentCount;
  // Số tài khoản bị khóa (trang_thai = 'khoa' trong DB)
  const lockedAccounts = userStats.locked || 0;
  // Số phiên đang hoạt động (sessions trong 5 phút)
  const liveSessions = realTimeSessions;
  // Số user đang online (có session active)
  const activeNowCount = Math.min(activeUsersCount || 0, totalAccounts);
  // Số user offline (không có session active và không bị khóa)
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

      {/* Neo-Brutalist Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          animation: 'neo-grid-move 20s linear infinite'
        }}></div>

        {/* Floating decorative elements */}
        <div className="absolute top-8 right-16 w-24 h-24 border-4 border-white/20 rounded-2xl rotate-12" style={{ animation: 'neo-float 4s ease-in-out infinite' }}></div>
        <div className="absolute bottom-8 left-12 w-16 h-16 bg-yellow-400/30 rounded-full" style={{ animation: 'neo-float 3s ease-in-out infinite 0.5s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-cyan-400/40 rotate-45"></div>

        <div className="relative z-10 p-6 lg:p-8">
          {/* Top bar: Badge + Account count + Action button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Neo Badge */}
              <div className="relative group">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-lg"></div>
                <div className="relative bg-white border-2 border-black px-4 py-2 rounded-lg flex items-center gap-2 transform transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                  <Shield className="w-5 h-5 text-violet-600" />
                  <span className="font-black text-sm text-gray-900 tracking-wide">NEO ADMIN</span>
                </div>
              </div>
              
              {/* Separator */}
              <div className="hidden sm:block h-6 w-px bg-white/30"></div>
              
              {/* Account count badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-semibold">{totalAccounts} tài khoản</span>
              </div>
            </div>

            {/* Add account button */}
            <button
              onClick={openCreateModal}
              className="group relative inline-flex items-center"
            >
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-xl transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5"></div>
              <div className="relative flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-black rounded-xl font-bold text-gray-900 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                <UserPlus className="w-5 h-5" />
                <span>Thêm tài khoản</span>
              </div>
            </button>
          </div>

          {/* Main title section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              Quản lý tài khoản
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200">
                TẬP TRUNG
              </span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg font-medium max-w-2xl leading-relaxed">
              Theo dõi hoạt động đăng nhập, trạng thái khóa/kích hoạt và phân bổ vai trò cho toàn bộ hệ thống.
            </p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Accounts */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black translate-x-1.5 translate-y-1.5 rounded-2xl transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
              <div className="relative bg-gradient-to-br from-amber-100 to-yellow-50 border-3 border-black p-4 rounded-2xl transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-amber-700" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">{totalAccounts}</p>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Tổng tài khoản</p>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black translate-x-1.5 translate-y-1.5 rounded-2xl transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
              <div className="relative bg-gradient-to-br from-emerald-100 to-green-50 border-3 border-black p-4 rounded-2xl transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-emerald-700" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">{liveSessions}</p>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Phiên hoạt động</p>
              </div>
            </div>

            {/* Locked Accounts */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black translate-x-1.5 translate-y-1.5 rounded-2xl transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
              <div className="relative bg-gradient-to-br from-rose-100 to-pink-50 border-3 border-black p-4 rounded-2xl transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-rose-700" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">{lockedAccounts}</p>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Bị khóa</p>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black translate-x-1.5 translate-y-1.5 rounded-2xl transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
              <div className="relative bg-gradient-to-br from-sky-100 to-cyan-50 border-3 border-black p-4 rounded-2xl transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutGrid className="w-5 h-5 text-sky-700" />
                </div>
                <p className="text-lg sm:text-xl font-black text-gray-900">{adminCount}/{teacherCount}/{classMonitorCount}/{studentCount}</p>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Admin • GV • LT • SV</p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes neo-grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 40px 40px; }
          }
          @keyframes neo-float {
            0%, 100% { transform: translateY(0px) rotate(12deg); }
            50% { transform: translateY(-10px) rotate(12deg); }
          }
          .border-3 {
            border-width: 3px;
          }
        `}</style>
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
                {(() => {
                  // Hiển thị tổng số user thực tế từ backend (sau khi filter)
                  // Nếu có filter, pagination.total sẽ là tổng số user thỏa mãn filter
                  // Nếu không có filter, pagination.total sẽ là tổng số user trong hệ thống
                  const totalFiltered = pagination.total || 0;
                  
                  // Nếu có search hoặc role filter, hiển thị số lượng đã filter
                  if (searchTerm || roleFilter || statusFilter) {
                    return `${totalFiltered} tài khoản${totalFiltered !== filteredUsers.length ? ` (hiển thị ${filteredUsers.length}/${totalFiltered})` : ''}`;
                  }
                  
                  // Nếu không có filter, hiển thị tổng số
                  return `${totalFiltered} tài khoản`;
                })()}
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sortBy || 'newest'}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer font-medium text-gray-700"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="name-az">Tên A → Z</option>
                  <option value="name-za">Tên Z → A</option>
                </select>
              </div>

              <div className="w-px h-8 bg-gray-200"></div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200 ml-auto">
                <button
                  onClick={() => setDisplayViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    displayViewMode === 'grid'
                      ? 'bg-white shadow-md text-violet-600 border border-violet-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Hiển thị dạng lưới"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Lưới</span>
                </button>
                <button
                  onClick={() => setDisplayViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    displayViewMode === 'list'
                      ? 'bg-white shadow-md text-violet-600 border border-violet-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Hiển thị dạng danh sách"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Danh sách</span>
                </button>
              </div>
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

      <div className={displayViewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5' 
        : 'space-y-3'
      }>
        {filteredUsers.length === 0 ? (
          <div className={displayViewMode === 'grid' ? 'col-span-full' : ''} style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#6b7280' }} />
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>
              Không tìm thấy người dùng nào
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const avatarInfo = user.sinh_vien ? getStudentAvatar(user.sinh_vien) : getUserAvatar(user);
            const derivedStatus = getDerivedStatus(user);
            const statusInfo = getStatusColor(derivedStatus);
            const roleInfo = getRoleColor(user.vai_tro?.ten_vt);
            
            // List View
            if (displayViewMode === 'list') {
              return (
                <div 
                  key={user.id}
                  className="group relative bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg hover:border-violet-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {avatarInfo.hasValidAvatar ? (
                        <img 
                          src={avatarInfo.src} 
                          alt={avatarInfo.alt}
                          className="w-12 h-12 rounded-full object-cover border-2"
                          style={{ borderColor: roleInfo.bg }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg"
                          style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}
                        >
                          {avatarInfo.fallback}
                        </div>
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                          {user.ho_ten || 'Chưa có tên'}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{user.ten_dn || 'N/A'}</p>
                      </div>
                      
                      <div className="hidden sm:block min-w-0">
                        <p className="text-sm text-gray-600 truncate flex items-center gap-1.5">
                          <Mail size={14} className="flex-shrink-0 text-gray-400" />
                          {user.email || 'Chưa có email'}
                        </p>
                        {user.sinh_vien?.mssv && (
                          <p className="text-sm text-gray-500 truncate flex items-center gap-1.5">
                            <GraduationCap size={14} className="flex-shrink-0 text-gray-400" />
                            {user.sinh_vien.mssv}
                          </p>
                        )}
                      </div>
                      
                      <div className="hidden lg:flex items-center gap-2 flex-wrap">
                        <span 
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}
                        >
                          {getDisplayRoleName(user.vai_tro?.ten_vt || user.role)}
                        </span>
                        <span 
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                        >
                          {statusInfo.text}
                        </span>
                      </div>
                      
                      <div className="hidden lg:block text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {user.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleViewDetails(user)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">Chi tiết</span>
                      </button>
                      {(user.trang_thai === 'khoa' || user.khoa === true) ? (
                        <button 
                          onClick={() => handleUnlockUser(user.id)}
                          title="Mở khóa tài khoản"
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                        >
                          <Unlock size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleLockUser(user.id)}
                          title="Khóa tài khoản"
                          className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all"
                        >
                          <Lock size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        title="Xóa tài khoản"
                        className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Grid View (default)
            return (
              <div 
                key={user.id}
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                  border: '1px solid #e5e7eb', 
                  transition: 'all 0.2s ease',
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: '500', padding: '2px 8px', borderRadius: '12px', backgroundColor: roleInfo.bg, color: roleInfo.color }}>
                        {getDisplayRoleName(user.vai_tro?.ten_vt || user.role)}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '500', padding: '2px 8px', borderRadius: '12px', backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px', minHeight: '140px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280', minHeight: '24px' }}>
                    <Mail size={14} style={{ flexShrink: 0 }} />
                    <span style={{ wordBreak: 'break-word' }}>{user.email || 'Chưa có email'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280', minHeight: '24px' }}>
                    <User size={14} style={{ flexShrink: 0 }} />
                    <span>{user.ten_dn || 'Chưa có username'}</span>
                  </div>
                  {user.sinh_vien && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280', minHeight: '24px' }}>
                        <GraduationCap size={14} style={{ flexShrink: 0 }} />
                        <span>MSSV: {user.sinh_vien.mssv}</span>
                      </div>
                      {user.sinh_vien.lop && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280', minHeight: '24px' }}>
                          <Users size={14} style={{ flexShrink: 0 }} />
                          <span>Lớp: {user.sinh_vien.lop.ten_lop}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280', minHeight: '24px' }}>
                    <Calendar size={14} style={{ flexShrink: 0 }} />
                    <span>Tham gia: {user.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString('vi-VN') : 'Không xác định'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', marginTop: 'auto' }}>
                  <button 
                    type="button"
                    onClick={() => handleViewDetails(user)}
                    style={{ ...buttonStyle, backgroundColor: '#3b82f6', color: 'white', flex: 1, justifyContent: 'center' }}
                  >
                    <Eye size={16} />
                    Chi tiết
                  </button>
                  {(user.trang_thai === 'khoa' || user.khoa === true) ? (
                    <button 
                      onClick={() => handleUnlockUser(user.id)}
                      title="Mở khóa tài khoản"
                      style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white', padding: '8px 12px' }}
                    >
                      <Unlock size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleLockUser(user.id)}
                      title="Khóa tài khoản"
                      style={{ ...buttonStyle, backgroundColor: '#f59e0b', color: 'white', padding: '8px 12px' }}
                    >
                      <Lock size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    title="Xóa tài khoản"
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>
                  {editMode ? 'Chỉnh sửa người dùng' : 'Chi tiết người dùng'}
                </h2>
                {selectedUser.trang_thai === 'khoa' && (
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '4px 10px', 
                    backgroundColor: '#fef2f2', 
                    color: '#dc2626', 
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    <Lock size={12} />
                    Đã khóa
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!editMode && selectedUser.id && (
                  (selectedUser.trang_thai === 'khoa') ? (
                    <button 
                      onClick={async () => { 
                        await handleUnlockUser(selectedUser.id); 
                        setSelectedUser(prev => ({ ...prev, trang_thai: 'hoat_dong' })); 
                      }} 
                      style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }}
                    >
                      <Unlock size={16} />
                      Mở khóa
                    </button>
                  ) : (
                    <button 
                      onClick={async () => { 
                        await handleLockUser(selectedUser.id); 
                        setSelectedUser(prev => ({ ...prev, trang_thai: 'khoa' })); 
                      }} 
                      style={{ ...buttonStyle, backgroundColor: '#f59e0b', color: 'white' }}
                    >
                      <Lock size={16} />
                      Khóa
                    </button>
                  )
                )}
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
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Mật khẩu {editMode && <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>(để trống nếu không đổi)</span>}</label>
                    <input type="password" value={selectedUser.mat_khau || ''} onChange={(e) => editMode && setSelectedUser({...selectedUser, mat_khau: e.target.value})} disabled={!editMode} placeholder={editMode ? "Nhập mật khẩu mới (tối thiểu 6 ký tự)" : ""} style={inputStyle} />
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
              {activeTab === 'personal' && (
                <div>
                  {/* Thông báo nếu user chưa có thông tin sinh viên */}
                  {!selectedUser.sinh_vien && editMode && (
                    <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', color: '#92400e' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>
                        ℹ️ Người dùng này chưa có thông tin sinh viên. Bạn có thể thêm thông tin bên dưới nếu cần.
                      </p>
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>MSSV</label>
                      <input 
                        type="text" 
                        value={selectedUser.sinh_vien?.mssv || ''} 
                        onChange={(e) => {
                          if (!editMode) return;
                          const sinhVien = selectedUser.sinh_vien || {};
                          setSelectedUser({ 
                            ...selectedUser, 
                            sinh_vien: {...sinhVien, mssv: e.target.value} 
                          });
                        }} 
                        disabled={!editMode} 
                        style={inputStyle} 
                        placeholder="Nhập mã số sinh viên"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Lớp</label>
                      <select 
                        value={selectedUser.sinh_vien?.lop_id || selectedUser.sinh_vien?.lop?.id || ''} 
                        onChange={(e) => {
                          if (!editMode) return;
                          const sinhVien = selectedUser.sinh_vien || {};
                          setSelectedUser({ 
                            ...selectedUser, 
                            sinh_vien: {...sinhVien, lop_id: e.target.value} 
                          });
                        }} 
                        disabled={!editMode} 
                        style={inputStyle}
                      >
                        <option value="">Chọn lớp</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.ten_lop} - {c.khoa}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Ngày sinh</label>
                      <input 
                        type="date" 
                        value={selectedUser.sinh_vien?.ngay_sinh ? new Date(selectedUser.sinh_vien.ngay_sinh).toISOString().split('T')[0] : ''} 
                        onChange={(e) => {
                          if (!editMode) return;
                          const sinhVien = selectedUser.sinh_vien || {};
                          setSelectedUser({ 
                            ...selectedUser, 
                            sinh_vien: {...sinhVien, ngay_sinh: e.target.value} 
                          });
                        }} 
                        disabled={!editMode} 
                        style={inputStyle} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Giới tính</label>
                      <select 
                        value={selectedUser.sinh_vien?.gt || ''} 
                        onChange={(e) => {
                          if (!editMode) return;
                          const sinhVien = selectedUser.sinh_vien || {};
                          setSelectedUser({ 
                            ...selectedUser, 
                            sinh_vien: {...sinhVien, gt: e.target.value} 
                          });
                        }} 
                        disabled={!editMode} 
                        style={inputStyle}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="nam">Nam</option>
                        <option value="nu">Nữ</option>
                        <option value="khac">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Số điện thoại</label>
                      <input 
                        type="tel" 
                        value={selectedUser.sinh_vien?.sdt || ''} 
                        onChange={(e) => {
                          if (!editMode) return;
                          const sinhVien = selectedUser.sinh_vien || {};
                          setSelectedUser({ 
                            ...selectedUser, 
                            sinh_vien: {...sinhVien, sdt: e.target.value} 
                          });
                        }} 
                        disabled={!editMode} 
                        style={inputStyle} 
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>Địa chỉ</label>
                      <textarea 
                        value={selectedUser.sinh_vien?.dia_chi || ''} 
                        onChange={(e) => {
                          if (!editMode) return;
                          const sinhVien = selectedUser.sinh_vien || {};
                          setSelectedUser({ 
                            ...selectedUser, 
                            sinh_vien: {...sinhVien, dia_chi: e.target.value} 
                          });
                        }} 
                        disabled={!editMode} 
                        rows={3} 
                        style={{...inputStyle, resize: 'vertical'}} 
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                    {editMode && (selectedUser.role === 'Lớp trưởng' || selectedUser.vai_tro?.ten_vt === 'LỚP_TRƯỞNG') && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                          <input 
                            type="checkbox" 
                            checked={!!selectedUser.set_lop_truong} 
                            onChange={(e) => setSelectedUser({ ...selectedUser, set_lop_truong: e.target.checked })} 
                          />
                          Đặt làm lớp trưởng cho lớp đã chọn
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'points' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Điểm Rèn Luyện</h3>
                    {userPoints?.total !== undefined && userPoints.total > 0 && (
                      <div style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', fontWeight: '600' }}>
                        Tổng: {userPoints.total} điểm
                      </div>
                    )}
                  </div>
                  
                  {(() => {
                    // Kiểm tra user có phải sinh viên/lớp trưởng không
                    const userRole = selectedUser?.vai_tro?.ten_vt || selectedUser?.role || '';
                    const roleLower = userRole.toLowerCase();
                    const isStudentRole = roleLower.includes('sinh viên') || 
                                       roleLower.includes('lop truong') || 
                                       roleLower.includes('lớp trưởng') ||
                                       userRole === 'SINH_VIEN' || userRole === 'SINH_VIÊN' ||
                                       userRole === 'LOP_TRUONG' || userRole === 'LỚP_TRƯỞNG';
                    const hasStudentInfo = selectedUser?.sinh_vien && (selectedUser.sinh_vien.id || selectedUser.sinh_vien.mssv);
                    
                    // Nếu là sinh viên/lớp trưởng nhưng chưa có thông tin sinh viên, hiển thị thông báo hướng dẫn
                    if (isStudentRole && !hasStudentInfo && editMode) {
                      return (
                        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                          <Award size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#92400e' }} />
                          <p style={{ color: '#92400e', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                            Vui lòng thêm thông tin sinh viên (MSSV và Lớp) ở tab "Thông tin cá nhân" để xem điểm rèn luyện
                          </p>
                        </div>
                      );
                    }
                    
                    // Hiển thị message từ backend nếu có (chỉ cho user không phải sinh viên)
                    if (userPoints?.message && !isStudentRole) {
                      return (
                        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                          <Award size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#6b7280' }} />
                          <p style={{ color: '#6b7280', fontSize: '14px' }}>{userPoints.message}</p>
                        </div>
                      );
                    }
                    
                    // Hiển thị empty state nếu không có điểm
                    if (!userPoints?.items || userPoints.items.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <Award size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#6b7280' }} />
                          <p style={{ color: '#6b7280' }}>Chưa có điểm rèn luyện</p>
                        </div>
                      );
                    }
                    
                    // Hiển thị danh sách điểm
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {userPoints.items.map((point, index) => (
                          <div key={index} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                                {point.activity_name || 'Hoạt động'}
                              </h4>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                {point.date ? new Date(point.date).toLocaleDateString('vi-VN', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                }) : 'N/A'}
                              </p>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: point.points > 0 ? '#10b981' : '#ef4444', marginLeft: '16px' }}>
                              {point.points || 0} điểm
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
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
