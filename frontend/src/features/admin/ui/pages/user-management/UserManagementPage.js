/**
 * Admin User Management Page (Neo UI - FSD Structure)
 * 
 * 3-Tier SOLID Architecture:
 * - services: userManagementApi
 * - model: useUserManagement hook
 * - ui: Hero, Filters, List, Modals components (từ shared/)
 */

import React, { useState, useMemo } from 'react';
import { useUserManagement } from '../../../model/hooks/useAdminUsersPage';
import {
  AdminUsersHero,
  AdminUsersStatusChips,
  AdminUsersFilterBar,
  AdminUsersResults,
  AdminUserDetailModal,
  AdminUserCreateModal
} from '../../shared/users';
import Pagination from '../../../../../shared/components/common/Pagination';

export default function UserManagementPage() {
  const {
    filteredUsers,
    roles,
    classes,
    loading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    pagination,
    setPagination,
    activeIds,
    activeCodes,
    selectedUser,
    setSelectedUser,
    userPoints,
    stats,
    activeSessionCount,
    statusFilter,
    setStatusFilter,
    lockUser,
    unlockUser,
    deleteUser,
    createUser,
    updateUser,
    fetchUserDetails
  } = useUserManagement();

  // View state
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  // Create form state
  const [createDraft, setCreateDraft] = useState({});
  const [createRoleTab, setCreateRoleTab] = useState('Admin');
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Combine activeIds and activeCodes for status check
  const allActiveIdentifiers = new Set([...activeIds, ...activeCodes]);

  // Use stats from API cho Hero / chips (fallback sang pagination)
  const totalAccounts = stats?.total || pagination?.total || filteredUsers.length;
  const liveSessions = (typeof activeSessionCount === 'number' && activeSessionCount >= 0)
    ? activeSessionCount
    : allActiveIdentifiers.size;
  const lockedAccounts = stats?.locked || 0;
  // Không hoạt động = Tổng - Phiên hoạt động (không tính bị khóa vào)
  const inactiveCount = Math.max(totalAccounts - liveSessions, 0);
  const roleCounts = stats?.roleCounts || {
    adminCount: 0,
    teacherCount: 0,
    classMonitorCount: 0,
    studentCount: 0
  };

  // Helper functions cho AdminUsersResults
  const getDerivedStatus = useMemo(() => (user) => {
    const locked = user.trang_thai === 'khoa' || user.khoa === true;
    if (locked) return 'khoa';
    const isActiveNow =
      allActiveIdentifiers.has(String(user.id)) ||
      allActiveIdentifiers.has(String(user.ten_dn)) ||
      (user.sinh_vien?.mssv && allActiveIdentifiers.has(String(user.sinh_vien.mssv)));
    return isActiveNow ? 'hoat_dong' : 'khong_hoat_dong';
  }, [allActiveIdentifiers]);

  const getStatusColor = useMemo(() => (status) => {
    const variants = {
      hoat_dong: { bg: '#dcfce7', color: '#15803d', text: 'Hoạt động' },
      khong_hoat_dong: { bg: '#f3f4f6', color: '#374151', text: 'Không hoạt động' },
      khoa: { bg: '#fef2f2', color: '#dc2626', text: 'Bị khóa' },
      default: { bg: '#fef3c7', color: '#92400e', text: 'Chưa xác định' }
    };
    return variants[status] || variants.default;
  }, []);

  const getRoleColor = useMemo(() => (role = '') => {
    const normalized = role.toString().trim();
    const lower = normalized.toLowerCase();
    const variants = [
      { match: ['admin'], bg: '#fef2f2', color: '#dc2626', label: 'Admin' },
      { match: ['giảng viên', 'gv'], bg: '#fef3c7', color: '#92400e', label: 'Giảng viên' },
      { match: ['lớp trưởng', 'lop truong'], bg: '#dbeafe', color: '#1e40af', label: 'Lớp trưởng' },
      { match: ['sinh viên', 'sinh vien'], bg: '#dcfce7', color: '#15803d', label: 'Sinh viên' }
    ];
    for (const variant of variants) {
      if (variant.match.some((key) => lower.includes(key))) {
        return { bg: variant.bg, color: variant.color, label: variant.label };
      }
    }
    return { bg: '#f3f4f6', color: '#374151', label: normalized || 'Chưa xác định' };
  }, []);

  const getDisplayRoleName = useMemo(() => (role = '') => {
    const roleColor = getRoleColor(role);
    return roleColor.label;
  }, [getRoleColor]);

  // Sort users
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.ngay_tao || 0) - new Date(a.ngay_tao || 0);
        case 'oldest':
          return new Date(a.ngay_tao || 0) - new Date(b.ngay_tao || 0);
        case 'name-az':
          return (a.ho_ten || '').localeCompare(b.ho_ten || '', 'vi');
        case 'name-za':
          return (b.ho_ten || '').localeCompare(a.ho_ten || '', 'vi');
        default:
          return 0;
      }
    });
  }, [filteredUsers, sortBy]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Add User Modal
  const handleAddUser = () => {
    setCreateDraft({});
    setCreateRoleTab('Admin');
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    setFormError('');
    setSubmitLoading(true);
    try {
      await createUser({ ...createDraft, role: createRoleTab });
      setShowCreateModal(false);
      setCreateDraft({});
    } catch (error) {
      setFormError(error.message || 'Không thể tạo người dùng');
    } finally {
      setSubmitLoading(false);
    }
  };

  // View Details Modal
  const handleViewDetails = async (user) => {
    setDetailLoading(true);
    setActiveTab('account');
    setEditMode(false);
    setShowDetailModal(true);
    try {
      await fetchUserDetails(user.id);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
    setEditMode(false);
  };

  const handleSaveUser = async () => {
    if (!selectedUser?.id) return;
    try {
      console.log('Saving user:', selectedUser);
      await updateUser(selectedUser.id, selectedUser);
      setEditMode(false);
      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Save error:', error);
      alert(error.message || 'Không thể cập nhật người dùng');
    }
  };

  // Lock/Unlock/Delete handlers
  const handleLockUser = async (user) => {
    if (window.confirm(`Bạn có chắc muốn khóa tài khoản "${user.ho_ten}"?`)) {
      try {
        await lockUser(user.id);
      } catch (error) {
        alert(error.message || 'Không thể khóa tài khoản');
      }
    }
  };

  const handleUnlockUser = async (user) => {
    try {
      await unlockUser(user.id);
    } catch (error) {
      alert(error.message || 'Không thể mở khóa tài khoản');
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản "${user.ho_ten}"? Hành động này không thể hoàn tác!`)) {
      try {
        await deleteUser(user.id);
      } catch (error) {
        alert(error.message || 'Không thể xóa tài khoản');
      }
    }
  };

  // Modal lock/unlock (from detail modal)
  const handleModalLockUser = async (userId) => {
    try {
      await lockUser(userId);
      // Refresh user details
      await fetchUserDetails(userId);
    } catch (error) {
      alert(error.message || 'Không thể khóa tài khoản');
    }
  };

  const handleModalUnlockUser = async (userId) => {
    try {
      await unlockUser(userId);
      // Refresh user details
      await fetchUserDetails(userId);
    } catch (error) {
      alert(error.message || 'Không thể mở khóa tài khoản');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <AdminUsersHero
          totalAccounts={totalAccounts}
          liveSessions={liveSessions}
          lockedAccounts={lockedAccounts}
          roleCounts={roleCounts}
          onCreateClick={handleAddUser}
        />

        {/* Status Chips Section */}
        <AdminUsersStatusChips
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          totalAccounts={totalAccounts}
          activeNowCount={liveSessions}
          lockedAccounts={lockedAccounts}
          inactiveCount={inactiveCount}
        />

        {/* Filters Section */}
        <AdminUsersFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roles={roles}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          summaryText={`${pagination?.total || filteredUsers.length} kết quả`}
          sortBy={sortBy}
          onSortChange={setSortBy}
          displayViewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Users List Section */}
        {loading && sortedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p>Đang tải danh sách người dùng...</p>
          </div>
        ) : (
          <>
            <AdminUsersResults
              users={sortedUsers}
              viewMode={viewMode}
              onViewDetails={handleViewDetails}
              onLockUser={(userId) => {
                const user = sortedUsers.find(u => u.id === userId);
                if (user) handleLockUser(user);
              }}
              onUnlockUser={(userId) => {
                const user = sortedUsers.find(u => u.id === userId);
                if (user) handleUnlockUser(user);
              }}
              onDeleteUser={(userId) => {
                const user = sortedUsers.find(u => u.id === userId);
                if (user) handleDeleteUser(user);
              }}
              getDerivedStatus={getDerivedStatus}
              getStatusColor={getStatusColor}
              getRoleColor={getRoleColor}
              getDisplayRoleName={getDisplayRoleName}
            />
            {pagination?.total > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 mt-8">
                <Pagination
                  pagination={{
                    page: pagination.page,
                    limit: pagination.limit,
                    total: pagination.total
                  }}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  itemLabel="tài khoản"
                  showLimitSelector
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      <AdminUserDetailModal
        isOpen={showDetailModal}
        selectedUser={selectedUser}
        editMode={editMode}
        onEditModeChange={setEditMode}
        onClose={handleCloseDetailModal}
        onSaveUser={handleSaveUser}
        onLockUser={handleModalLockUser}
        onUnlockUser={handleModalUnlockUser}
        roles={roles}
        classes={classes}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        setSelectedUser={setSelectedUser}
        userPoints={userPoints}
        detailLoading={detailLoading}
      />

      {/* Create User Modal */}
      <AdminUserCreateModal
        isOpen={showCreateModal}
        draft={createDraft}
        onClose={() => setShowCreateModal(false)}
        onChange={setCreateDraft}
        createRoleTab={createRoleTab}
        onRoleTabChange={setCreateRoleTab}
        onSubmit={handleCreateSubmit}
        submitLoading={submitLoading}
        classes={classes}
        formError={formError}
      />
    </div>
  );
}
