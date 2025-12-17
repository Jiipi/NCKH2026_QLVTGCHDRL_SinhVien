/**
 * Admin Users Page Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho trang quản lý người dùng
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import userManagementApi, { 
  type ApiResult, 
  type FetchUsersParams,
  type UsersListData 
} from '../../services/userManagementApi';
import { useNotification } from '../../../../shared/contexts/NotificationContext';

// ============= INTERFACES =============

export interface User {
  id: string;
  username?: string;
  email?: string;
  ho_ten?: string;
  mssv?: string;
  role?: string;
  vai_tro?: string | { id: string; ten_vai_tro?: string };
  trang_thai?: string;
  status?: string;
  avatar_url?: string;
  lop?: { id: string; ten_lop?: string };
  khoa?: { id: string; ten_khoa?: string };
  ngay_tao?: string;
  last_login?: string;
  [key: string]: unknown;
}

export interface Role {
  id: string;
  ten_vai_tro?: string;
  name?: string;
  ma_vai_tro?: string;
}

export interface Class {
  id: string;
  ten_lop?: string;
  name?: string;
}

export interface Department {
  id: string;
  ten_khoa?: string;
  name?: string;
}

interface Filters {
  role: string;
  status: string;
  department: string;
  class: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

type ViewMode = 'grid' | 'table';

// ============= CONSTANTS =============

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: '🟢 Hoạt động' },
  { value: 'inactive', label: '🔴 Không hoạt động' },
  { value: 'locked', label: '🔒 Bị khóa' }
];

const ROLE_DISPLAY_MAP: Record<string, string> = {
  sinh_vien: '🎓 Sinh viên',
  giang_vien: '👨‍🏫 Giảng viên',
  can_bo_khoa: '👔 Cán bộ khoa',
  can_bo_doan: '🏢 Cán bộ đoàn',
  admin: '👑 Quản trị viên',
  super_admin: '⭐ Super Admin'
};

// ============= HOOK =============

export function useUserManagement() {
  const { showSuccess, showError, confirm } = useNotification();

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    role: '',
    status: '',
    department: '',
    class: ''
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'ngay_tao',
    direction: 'desc'
  });
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  // Additional state for UserManagementPage compatibility
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});

  // ============= DATA LOADING =============

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: FetchUsersParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: query || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
        department: filters.department || undefined,
        class_id: filters.class || undefined,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        const k = key as keyof FetchUsersParams;
        if (params[k] === undefined || params[k] === '') {
          delete params[k];
        }
      });

      const result = await userManagementApi.fetchUsers(params) as ApiResult<UsersListData>;

      if (result.success && result.data) {
        const data = result.data as UsersListData;
        setUsers((data.items as User[]) || []);
        setPagination(prev => ({
          ...prev,
          total: data?.total || 0
        }));
      } else {
        setError(result.error || 'Không thể tải danh sách người dùng');
        setUsers([]);
      }
    } catch (err: unknown) {
      console.error('Failed to load users:', err);
      setError((err as Error).message || 'Lỗi tải dữ liệu');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [query, filters, pagination.page, pagination.limit, sortConfig]);

  const loadRoles = useCallback(async () => {
    try {
      const result = await userManagementApi.fetchRoles();
      if (result.success && result.data) {
        setRoles(Array.isArray(result.data) ? result.data as Role[] : []);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      const result = await userManagementApi.fetchClasses();
      if (result.success && result.data) {
        setClasses(Array.isArray(result.data) ? result.data as Class[] : []);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const result = await userManagementApi.fetchDepartments();
      if (result.success && result.data) {
        setDepartments(Array.isArray(result.data) ? result.data as Department[] : []);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRoles();
    loadClasses();
    loadDepartments();
  }, [loadRoles, loadClasses, loadDepartments]);


  // Load users when filters/pagination change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ============= USER ACTIONS =============

  const handleCreateUser = useCallback(async (userData: Partial<User>) => {
    try {
      const result = await userManagementApi.createUser(userData);
      if (result.success) {
        showSuccess('Tạo người dùng thành công!');
        setIsAddModalOpen(false);
        loadUsers();
        return true;
      } else {
        showError(result.error || 'Không thể tạo người dùng');
        return false;
      }
    } catch (err: any) {
      showError(err.message || 'Lỗi tạo người dùng');
      return false;
    }
  }, [showSuccess, showError, loadUsers]);

  const handleUpdateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    try {
      const result = await userManagementApi.updateUser(userId, userData);
      if (result.success) {
        showSuccess('Cập nhật người dùng thành công!');
        setIsEditModalOpen(false);
        setEditingUser(null);
        loadUsers();
        return true;
      } else {
        showError(result.error || 'Không thể cập nhật người dùng');
        return false;
      }
    } catch (err: any) {
      showError(err.message || 'Lỗi cập nhật người dùng');
      return false;
    }
  }, [showSuccess, showError, loadUsers]);

  const handleDeleteUser = useCallback(async (userId: string, userName?: string) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa người dùng "${userName || userId}"? Hành động này không thể hoàn tác.`
    });

    if (!isConfirmed) return false;

    try {
      const result = await userManagementApi.deleteUser(userId);
      if (result.success) {
        showSuccess('Đã xóa người dùng!');
        loadUsers();
        return true;
      } else {
        showError(result.error || 'Không thể xóa người dùng');
        return false;
      }
    } catch (err: any) {
      showError(err.message || 'Lỗi xóa người dùng');
      return false;
    }
  }, [confirm, showSuccess, showError, loadUsers]);

  const handleToggleStatus = useCallback(async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';

    try {
      const result = await userManagementApi.updateUserStatus(userId, newStatus);
      if (result.success) {
        showSuccess(`Đã ${action} người dùng!`);
        loadUsers();
        return true;
      } else {
        showError(result.error || `Không thể ${action} người dùng`);
        return false;
      }
    } catch (err: any) {
      showError(err.message || `Lỗi ${action} người dùng`);
      return false;
    }
  }, [showSuccess, showError, loadUsers]);

  const handleResetPassword = useCallback(async (userId: string, userName?: string) => {
    const isConfirmed = await confirm({
      title: 'Đặt lại mật khẩu',
      message: `Bạn có chắc muốn đặt lại mật khẩu cho "${userName || userId}"?`
    });

    if (!isConfirmed) return false;

    try {
      const result = await userManagementApi.resetPassword(userId);
      if (result.success) {
        showSuccess('Đã đặt lại mật khẩu! Mật khẩu mới đã được gửi đến email người dùng.');
        return true;
      } else {
        showError(result.error || 'Không thể đặt lại mật khẩu');
        return false;
      }
    } catch (err: any) {
      showError(err.message || 'Lỗi đặt lại mật khẩu');
      return false;
    }
  }, [confirm, showSuccess, showError]);

  // Lock/Unlock user actions (wrappers for handleToggleStatus)
  const lockUser = useCallback(async (userId: string) => {
    try {
      const result = await userManagementApi.updateUserStatus(userId, 'locked');
      if (result.success) {
        showSuccess('Đã khóa tài khoản!');
        loadUsers();
        return true;
      } else {
        showError(result.error || 'Không thể khóa tài khoản');
        return false;
      }
    } catch (err: any) {
      showError(err.message || 'Lỗi khóa tài khoản');
      return false;
    }
  }, [showSuccess, showError, loadUsers]);

  const unlockUser = useCallback(async (userId: string) => {
    try {
      const result = await userManagementApi.updateUserStatus(userId, 'active');
      if (result.success) {
        showSuccess('Đã mở khóa tài khoản!');
        loadUsers();
        return true;
      } else {
        showError(result.error || 'Không thể mở khóa tài khoản');
        return false;
      }
    } catch (err: any) {
      showError(err.message || 'Lỗi mở khóa tài khoản');
      return false;
    }
  }, [showSuccess, showError, loadUsers]);

  // Fetch user details
  const fetchUserDetails = useCallback(async (userId: string) => {
    try {
      const result = await userManagementApi.fetchUserDetails(userId);
      if (result.success && result.data) {
        setSelectedUser(result.data as User);
        return result.data as User;
      } else {
        showError(result.error || 'Không thể tải thông tin người dùng');
        return null;
      }
    } catch (err: any) {
      showError(err.message || 'Lỗi tải thông tin người dùng');
      return null;
    }
  }, [showError]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedUsers.length === 0) {
      showError('Vui lòng chọn ít nhất một người dùng');
      return false;
    }

    const isConfirmed = await confirm({
      title: 'Xác nhận xóa hàng loạt',
      message: `Bạn có chắc muốn xóa ${selectedUsers.length} người dùng đã chọn?`
    });

    if (!isConfirmed) return false;

    try {
      const result = await userManagementApi.bulkDeleteUsers(selectedUsers);
      if (result.success) {
        showSuccess(`Đã xóa ${selectedUsers.length} người dùng!`);
        setSelectedUsers([]);
        loadUsers();
        return true;
      } else {
        showError(result.error || 'Không thể xóa người dùng');
        return false;
      }
    } catch (err: any) {
      showError(err.message || 'Lỗi xóa người dùng');
      return false;
    }
  }, [selectedUsers, confirm, showSuccess, showError, loadUsers]);

  // ============= UI HANDLERS =============

  const handleSearch = useCallback((e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleSortChange = useCallback((field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleSelectAllUsers = useCallback((selectAll: boolean) => {
    if (selectAll) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  }, [users]);

  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleViewDetail = useCallback((user: User) => {
    setDetailUser(user);
    setIsDetailModalOpen(true);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({ role: '', status: '', department: '', class: '' });
    setQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const getActiveFilterCount = useCallback((): number => {
    let count = 0;
    if (filters.role) count++;
    if (filters.status) count++;
    if (filters.department) count++;
    if (filters.class) count++;
    return count;
  }, [filters]);

  // ============= COMPUTED VALUES =============

  const roleOptions = useMemo(() => {
    return [
      { value: '', label: 'Tất cả vai trò' },
      ...roles.map(role => ({
        value: role.ma_vai_tro || role.id,
        label: ROLE_DISPLAY_MAP[role.ma_vai_tro || ''] || role.ten_vai_tro || role.name || role.id
      }))
    ];
  }, [roles]);

  const classOptions = useMemo(() => {
    return [
      { value: '', label: 'Tất cả lớp' },
      ...classes.map(cls => ({
        value: cls.id,
        label: cls.ten_lop || cls.name || cls.id
      }))
    ];
  }, [classes]);

  const departmentOptions = useMemo(() => {
    return [
      { value: '', label: 'Tất cả khoa' },
      ...departments.map(dept => ({
        value: dept.id,
        label: dept.ten_khoa || dept.name || dept.id
      }))
    ];
  }, [departments]);

  const totalPages = useMemo(() => {
    return Math.ceil(pagination.total / pagination.limit);
  }, [pagination.total, pagination.limit]);

  const isAllSelected = useMemo(() => {
    return users.length > 0 && selectedUsers.length === users.length;
  }, [users.length, selectedUsers.length]);

  const hasSelectedUsers = useMemo(() => {
    return selectedUsers.length > 0;
  }, [selectedUsers.length]);

  // ============= COMPUTED VALUES FOR PAGE COMPATIBILITY =============

  // filteredUsers is an alias for users (filtering is done server-side)
  const filteredUsers = users;

  // Alias for query/setQuery (legacy naming)
  const searchTerm = query;
  const setSearchTerm = setQuery;

  // Alias for filters.role (legacy naming)
  const roleFilter = filters.role;
  const setRoleFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, role: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Alias for filters.status (legacy naming)
  const setStatusFilterHandler = useCallback((value: string) => {
    setStatusFilter(value);
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Placeholder values for session tracking (not implemented server-side yet)
  const activeIds = useMemo<string[]>(() => [], []);
  const activeCodes = useMemo<string[]>(() => [], []);
  const activeSessionCount = 0;

  // Stats computed from current data
  const stats = useMemo(() => {
    const total = pagination.total || users.length;
    const locked = users.filter(u => u.trang_thai === 'locked' || u.status === 'locked').length;
    const roleCounts = {
      adminCount: users.filter(u => {
        const role = typeof u.vai_tro === 'string' ? u.vai_tro : (u.vai_tro as { ten_vai_tro?: string })?.ten_vai_tro || u.role;
        return role?.toLowerCase().includes('admin');
      }).length,
      teacherCount: users.filter(u => {
        const role = typeof u.vai_tro === 'string' ? u.vai_tro : (u.vai_tro as { ten_vai_tro?: string })?.ten_vai_tro || u.role;
        return role?.toLowerCase().includes('giang_vien') || role?.toLowerCase().includes('giảng viên');
      }).length,
      classMonitorCount: users.filter(u => {
        const role = typeof u.vai_tro === 'string' ? u.vai_tro : (u.vai_tro as { ten_vai_tro?: string })?.ten_vai_tro || u.role;
        return role?.toLowerCase().includes('lop_truong') || role?.toLowerCase().includes('lớp trưởng');
      }).length,
      studentCount: users.filter(u => {
        const role = typeof u.vai_tro === 'string' ? u.vai_tro : (u.vai_tro as { ten_vai_tro?: string })?.ten_vai_tro || u.role;
        return role?.toLowerCase().includes('sinh_vien') || role?.toLowerCase().includes('sinh viên');
      }).length
    };
    return { total, locked, roleCounts };
  }, [users, pagination.total]);

  // Wrapper functions for CRUD operations (legacy naming)
  const createUser = handleCreateUser;
  const updateUser = handleUpdateUser;
  const deleteUser = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    return handleDeleteUser(userId, user?.ho_ten);
  }, [handleDeleteUser, users]);

  // ============= HELPERS =============

  const getRoleDisplay = useCallback((role: string | undefined): string => {
    return ROLE_DISPLAY_MAP[role || ''] || role || 'Không xác định';
  }, []);

  const getStatusDisplay = useCallback((status: string | undefined): { label: string; color: string } => {
    const statusMap: Record<string, { label: string; color: string }> = {
      active: { label: 'Hoạt động', color: 'green' },
      inactive: { label: 'Không hoạt động', color: 'red' },
      locked: { label: 'Bị khóa', color: 'gray' }
    };
    return statusMap[status || ''] || { label: 'Không xác định', color: 'gray' };
  }, []);

  const formatDate = useCallback((dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  }, []);

  // ============= RETURN =============

  return {
    // Data
    users,
    filteredUsers,
    roles,
    classes,
    departments,
    loading,
    error,
    pagination,
    setPagination,
    sortConfig,

    // UI State
    query,
    setQuery,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter: setStatusFilterHandler,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    selectedUsers,

    // Modal State
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingUser,
    setEditingUser,
    isDetailModalOpen,
    setIsDetailModalOpen,
    detailUser,
    setDetailUser,
    selectedUser,
    setSelectedUser,

    // Session/Stats
    activeIds,
    activeCodes,
    activeSessionCount,
    stats,
    userPoints,

    // Options
    roleOptions,
    classOptions,
    departmentOptions,
    STATUS_OPTIONS,

    // Computed
    totalPages,
    isAllSelected,
    hasSelectedUsers,

    // Actions
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleStatus,
    handleResetPassword,
    handleBulkDelete,
    lockUser,
    unlockUser,
    createUser,
    updateUser,
    deleteUser,
    fetchUserDetails,

    // UI Handlers
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handleLimitChange,
    handleSelectUser,
    handleSelectAllUsers,
    handleEditUser,
    handleViewDetail,
    clearAllFilters,
    getActiveFilterCount,
    reload: loadUsers,

    // Helpers
    getRoleDisplay,
    getStatusDisplay,
    formatDate,
    ROLE_DISPLAY_MAP
  };
}

export default useUserManagement;
