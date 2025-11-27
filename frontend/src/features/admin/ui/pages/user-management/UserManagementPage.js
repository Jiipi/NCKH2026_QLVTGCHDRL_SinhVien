/**
 * Admin User Management Page (Neo UI - FSD Structure)
 * 
 * 3-Tier SOLID Architecture:
 * - services: userManagementApi
 * - model: useUserManagement hook
 * - ui: Hero, Filters, List, Modals components
 */

import React, { useState } from 'react';
import { useUserManagement } from '../../../model/hooks/useAdminUsersPage';
import AdminUsersHero from '../admin-users/components/AdminUsersHero';
import AdminUsersFilters from '../admin-users/components/AdminUsersFilters';
import AdminUsersStatusChips from '../admin-users/components/AdminUsersStatusChips';
import AdminUsersList from '../admin-users/components/AdminUsersList';
import AdminUserDetailModal from '../admin-users/components/AdminUserDetailModal';
import AdminUserCreateModal from '../admin-users/components/AdminUserCreateModal';

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

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
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
          onAddUser={handleAddUser}
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
        <AdminUsersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roles={roles}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          countLabel={`${pagination?.total || filteredUsers.length} kết quả`}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Users List Section */}
        <AdminUsersList
          loading={loading}
          users={sortedUsers}
          viewMode={viewMode}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          activeUserIds={allActiveIdentifiers}
          onViewDetails={handleViewDetails}
          onLockUser={handleLockUser}
          onUnlockUser={handleUnlockUser}
          onDeleteUser={handleDeleteUser}
        />
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
