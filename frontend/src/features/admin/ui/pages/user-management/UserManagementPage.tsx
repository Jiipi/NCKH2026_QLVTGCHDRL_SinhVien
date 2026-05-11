/**
 * Admin User Management Page (Neo UI - FSD Structure)
 * 
 * 3-Tier SOLID Architecture:
 * - services: userManagementApi
 * - model: useUserManagement hook
 * - ui: Hero, Filters, List, Modals components (từ shared/)
 */

import React, { useState, useMemo } from 'react';
import { useUserManagement, type User } from '../../../model/hooks/useAdminUsersPage';
import {
  AdminUsersHero,
  AdminUsersStatusChips,
  AdminUsersFilterBar,
  AdminUsersResults,
  AdminUserDetailModal,
  AdminUserCreateModal
} from '../../shared/users';
import Pagination from '../../../../../shared/components/common/Pagination';

interface RoleCounts {
  adminCount: number;
  teacherCount: number;
  classMonitorCount: number;
  studentCount: number;
}

interface StatusColorResult {
  bg: string;
  color: string;
  text: string;
}

interface RoleColorResult {
  bg: string;
  color: string;
  label: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

type SortOption = 'newest' | 'oldest' | 'name-az' | 'name-za';
type ViewMode = 'grid' | 'list';
type StatusType = 'hoat_dong' | 'khong_hoat_dong' | 'khoa';

const UserManagementPage: React.FC = () => {
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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('account');

  // Create form state
  const [createDraft, setCreateDraft] = useState<Record<string, unknown>>({});
  const [createRoleTab, setCreateRoleTab] = useState<string>('Admin');
  const [formError, setFormError] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // Combine activeIds and activeCodes for status check
  const allActiveIdentifiers = new Set([...activeIds, ...activeCodes]);

  // Use stats from API cho Hero / chips (fallback sang pagination)
  const totalAccounts = stats?.total || (pagination as PaginationState)?.total || filteredUsers.length;
  const liveSessions = (typeof activeSessionCount === 'number' && activeSessionCount >= 0)
    ? activeSessionCount
    : allActiveIdentifiers.size;
  const lockedAccounts = stats?.locked || 0;
  // Không hoạt động = Tổng - Phiên hoạt động (không tính bị khóa vào)
  const inactiveCount = Math.max(totalAccounts - liveSessions, 0);
  const roleCounts: RoleCounts = stats?.roleCounts || {
    adminCount: 0,
    teacherCount: 0,
    classMonitorCount: 0,
    studentCount: 0
  };

  // Helper functions cho AdminUsersResults
  const getDerivedStatus = useMemo(() => (user: User): StatusType => {
    // Check locked status via trang_thai field
    const locked = user.trang_thai === 'khoa' || user.status === 'khoa';
    if (locked) return 'khoa';
    const isActiveNow =
      allActiveIdentifiers.has(String(user.id)) ||
      allActiveIdentifiers.has(String(user.username)) ||
      (user.mssv && allActiveIdentifiers.has(String(user.mssv)));
    return isActiveNow ? 'hoat_dong' : 'khong_hoat_dong';
  }, [allActiveIdentifiers]);

  const getStatusColor = useMemo(() => (status: string): StatusColorResult => {
    const variants: Record<string, StatusColorResult> = {
      hoat_dong: { bg: '#dcfce7', color: '#15803d', text: 'Hoạt động' },
      khong_hoat_dong: { bg: '#f3f4f6', color: '#374151', text: 'Không hoạt động' },
      khoa: { bg: '#fef2f2', color: '#dc2626', text: 'Bị khóa' },
      default: { bg: '#fef3c7', color: '#92400e', text: 'Chưa xác định' }
    };
    return variants[status] || variants.default;
  }, []);

  const getRoleColor = useMemo(() => (role: string = ''): RoleColorResult => {
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

  const getDisplayRoleName = useMemo(() => (role: string = ''): string => {
    const roleColor = getRoleColor(role);
    return roleColor.label;
  }, [getRoleColor]);

  // Sort users
  const sortedUsers = useMemo((): User[] => {
    return [...(filteredUsers as User[])].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime();
        case 'oldest':
          return new Date(a.ngay_tao || 0).getTime() - new Date(b.ngay_tao || 0).getTime();
        case 'name-az':
          return (a.ho_ten || '').localeCompare(b.ho_ten || '', 'vi');
        case 'name-za':
          return (b.ho_ten || '').localeCompare(a.ho_ten || '', 'vi');
        default:
          return 0;
      }
    });
  }, [filteredUsers, sortBy]);

  const handlePageChange = (newPage: number): void => {
    setPagination((prev: PaginationState) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number): void => {
    setPagination((prev: PaginationState) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Add User Modal
  const handleAddUser = (): void => {
    setCreateDraft({});
    setCreateRoleTab('Admin');
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (): Promise<void> => {
    setFormError('');
    setSubmitLoading(true);
    try {
      await createUser({ ...createDraft, role: createRoleTab });
      setShowCreateModal(false);
      setCreateDraft({});
    } catch (error) {
      setFormError((error as Error).message || 'Không thể tạo người dùng');
    } finally {
      setSubmitLoading(false);
    }
  };

  // View Details Modal
  const handleViewDetails = async (user: User): Promise<void> => {
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

  const handleCloseDetailModal = (): void => {
    setShowDetailModal(false);
    setSelectedUser(null);
    setEditMode(false);
  };

  const handleSaveUser = async (): Promise<void> => {
    if (!selectedUser?.id) return;
    try {
      console.log('Saving user:', selectedUser);
      await updateUser(selectedUser.id, selectedUser);
      setEditMode(false);
      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Save error:', error);
      alert((error as Error).message || 'Không thể cập nhật người dùng');
    }
  };

  // Lock/Unlock/Delete handlers
  const handleLockUser = async (user: User): Promise<void> => {
    if (window.confirm(`Bạn có chắc muốn khóa tài khoản "${user.ho_ten}"?`)) {
      try {
        await lockUser(user.id);
      } catch (error) {
        alert((error as Error).message || 'Không thể khóa tài khoản');
      }
    }
  };

  const handleUnlockUser = async (user: User): Promise<void> => {
    try {
      await unlockUser(user.id);
    } catch (error) {
      alert((error as Error).message || 'Không thể mở khóa tài khoản');
    }
  };

  const handleDeleteUser = async (user: User): Promise<void> => {
    if (window.confirm(`Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản "${user.ho_ten}"? Hành động này không thể hoàn tác!`)) {
      try {
        await deleteUser(user.id);
      } catch (error) {
        alert((error as Error).message || 'Không thể xóa tài khoản');
      }
    }
  };

  // Modal lock/unlock (from detail modal)
  const handleModalLockUser = async (userId: string): Promise<void> => {
    try {
      await lockUser(userId);
      // Refresh user details
      await fetchUserDetails(userId);
    } catch (error) {
      alert((error as Error).message || 'Không thể khóa tài khoản');
    }
  };

  const handleModalUnlockUser = async (userId: string): Promise<void> => {
    try {
      await unlockUser(userId);
      // Refresh user details
      await fetchUserDetails(userId);
    } catch (error) {
      alert((error as Error).message || 'Không thể mở khóa tài khoản');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
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
          roles={roles as { id: string; ten_vai_tro?: string; name?: string; ma_vai_tro?: string; [key: string]: unknown }[]}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          summaryText={`${(pagination as PaginationState)?.total || filteredUsers.length} kết quả`}
          sortBy={sortBy}
          onSortChange={(value: string) => setSortBy(value as SortOption)}
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
              users={sortedUsers as unknown as Parameters<typeof AdminUsersResults>[0]['users']}
              viewMode={viewMode}
              onViewDetails={(user) => handleViewDetails(user as unknown as User)}
              onLockUser={(userId: string) => {
                const user = sortedUsers.find(u => u.id === userId);
                if (user) handleLockUser(user);
              }}
              onUnlockUser={(userId: string) => {
                const user = sortedUsers.find(u => u.id === userId);
                if (user) handleUnlockUser(user);
              }}
              onDeleteUser={(userId: string) => {
                const user = sortedUsers.find(u => u.id === userId);
                if (user) handleDeleteUser(user);
              }}
              getDerivedStatus={(user) => getDerivedStatus(user as unknown as User)}
              getStatusColor={getStatusColor}
              getRoleColor={getRoleColor}
              getDisplayRoleName={getDisplayRoleName}
            />
            {(pagination as PaginationState)?.total > 0 && (
              <div className="mt-8 rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
                <Pagination
                  pagination={{
                    page: (pagination as PaginationState).page,
                    limit: (pagination as PaginationState).limit,
                    total: (pagination as PaginationState).total
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
        setEditMode={setEditMode}
        onClose={handleCloseDetailModal}
        onSave={handleSaveUser}
        onLockUser={handleModalLockUser}
        onUnlockUser={handleModalUnlockUser}
        roles={roles}
        classes={classes}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        setSelectedUser={setSelectedUser}
        userPoints={userPoints}
        detailLoading={detailLoading}
        handleRoleSelect={(roleId: string) => {
          setSelectedUser((prev: typeof selectedUser) => prev ? { ...prev, vai_tro: { id: roleId } } : prev);
        }}
      />

      {/* Create User Modal */}
      <AdminUserCreateModal
        isOpen={showCreateModal}
        selectedUser={createDraft}
        onClose={() => setShowCreateModal(false)}
        setSelectedUser={setCreateDraft}
        createRoleTab={createRoleTab}
        onRoleTabChange={setCreateRoleTab}
        onSubmit={handleCreateSubmit}
        submitLoading={submitLoading}
        classes={classes}
        formError={formError}
      />
    </div>
  );
};

export default UserManagementPage;
