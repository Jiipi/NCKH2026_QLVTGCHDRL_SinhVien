import { useState, useEffect, useCallback } from 'react';
import usersApi from '../services/usersApi';
import { useNotification } from '../../../contexts/NotificationContext';

export function useAdminUsers() {
  const { showError, showSuccess, confirm } = useNotification();

  // Data states
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [classes, setClasses] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchUsers = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    setLoading(true);
    const params = { page, limit, search: searchTerm, role: roleFilter };
    const result = await usersApi.getUsers(params);

    if (result.success) {
      setUsers(result.data);
      setPagination(result.pagination);
    } else {
      setError('Không thể tải danh sách người dùng.');
      showError('Không thể tải danh sách người dùng.');
    }
    setLoading(false);
  }, [pagination.page, pagination.limit, searchTerm, roleFilter, showError]);

  const fetchInitialData = useCallback(async () => {
    const [rolesResult, classesResult] = await Promise.all([
      usersApi.getRoles(),
      usersApi.getClasses(),
    ]);

    if (rolesResult.success) setRoles(rolesResult.data);
    if (classesResult.success) setClasses(classesResult.data);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchInitialData();
  }, []);

  // Refetch when filters or page change
  useEffect(() => {
    const handler = setTimeout(() => {
        // Reset to page 1 when filters change
        if (pagination.page !== 1) {
            setPagination(p => ({ ...p, page: 1 }));
        } else {
            fetchUsers(1);
        }
    }, 300); // Debounce search

    return () => clearTimeout(handler);
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
      fetchUsers();
  }, [pagination.page]);

  const handleDeleteUser = async (user) => {
    const confirmed = await confirm({
        title: `Xác nhận xóa người dùng`,
        message: `Bạn có chắc chắn muốn xóa vĩnh viễn người dùng "${user.ho_ten}"? Hành động này không thể hoàn tác.`
    });

    if (!confirmed) return;

    const result = await usersApi.deleteUser(user.id);
    if (result.success) {
      showSuccess('Đã xóa người dùng thành công.');
      fetchUsers(); // Refresh list
    } else {
      showError(result.error);
    }
  };

  return {
    // State
    users,
    roles,
    classes,
    loading,
    error,
    pagination,
    searchTerm,
    roleFilter,
    statusFilter,

    // Setters
    setPagination,
    setSearchTerm,
    setRoleFilter,
    setStatusFilter,

    // Actions
    fetchUsers,
    handleDeleteUser,
  };
}

