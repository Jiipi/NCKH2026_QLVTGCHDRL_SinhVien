import React from 'react';
import { Users } from 'lucide-react';
import Pagination from '../../../../../../shared/components/common/Pagination';
import AdminUserCard from './AdminUserCard';
import AdminUserRow from './AdminUserRow';

const STATUS_VARIANTS = {
  hoat_dong: { bg: '#dcfce7', color: '#15803d', text: 'Hoạt động' },
  khong_hoat_dong: { bg: '#f3f4f6', color: '#374151', text: 'Không hoạt động' },
  khoa: { bg: '#fef2f2', color: '#dc2626', text: 'Bị khóa' },
  default: { bg: '#fef3c7', color: '#92400e', text: 'Chưa xác định' }
};

const ROLE_VARIANTS = [
  { match: ['admin'], bg: '#fef2f2', color: '#dc2626', label: 'Admin' },
  { match: ['giảng viên', 'gv'], bg: '#fef3c7', color: '#92400e', label: 'Giảng viên' },
  { match: ['lớp trưởng', 'lop truong'], bg: '#dbeafe', color: '#1e40af', label: 'Lớp trưởng' },
  { match: ['sinh viên', 'sinh vien'], bg: '#dcfce7', color: '#15803d', label: 'Sinh viên' }
];

export default function AdminUsersList({
  loading,
  users = [],
  viewMode = 'grid',
  pagination,
  onPageChange,
  onLimitChange,
  activeUserIds = new Set(),
  onViewDetails,
  onLockUser,
  onUnlockUser,
  onDeleteUser
}) {
  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  if (!loading && users.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
        <Users size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 text-lg">Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  const preparedUsers = users.map((user) => {
    const derivedStatus = getDerivedStatus(user, activeUserIds);
    const statusInfo = STATUS_VARIANTS[derivedStatus] || STATUS_VARIANTS.default;
    const roleInfo = getRoleInfo(user.vai_tro?.ten_vt || user.role);
    return { user, statusInfo, roleInfo };
  });

  const gridView = viewMode === 'grid';

  return (
    <>
      <div className={gridView ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-3'}>
        {preparedUsers.map(({ user, statusInfo, roleInfo }) =>
          gridView ? (
            <AdminUserCard
              key={user.id}
              user={user}
              roleInfo={roleInfo}
              statusInfo={statusInfo}
              onViewDetails={onViewDetails}
              onLockUser={onLockUser}
              onUnlockUser={onUnlockUser}
              onDeleteUser={onDeleteUser}
            />
          ) : (
            <AdminUserRow
              key={user.id}
              user={user}
              roleInfo={roleInfo}
              statusInfo={statusInfo}
              onViewDetails={onViewDetails}
              onLockUser={onLockUser}
              onUnlockUser={onUnlockUser}
              onDeleteUser={onDeleteUser}
            />
          )
        )}
      </div>

      {pagination?.total > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 mt-8">
          <Pagination
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total
            }}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            itemLabel="tài khoản"
            showLimitSelector
          />
        </div>
      )}
    </>
  );
}

function getDerivedStatus(user, activeUserIds) {
  const locked = user.trang_thai === 'khoa' || user.khoa === true;
  if (locked) return 'khoa';
  const isActiveNow =
    activeUserIds.has(String(user.id)) ||
    activeUserIds.has(String(user.ten_dn)) ||
    (user.sinh_vien?.mssv && activeUserIds.has(String(user.sinh_vien.mssv)));
  return isActiveNow ? 'hoat_dong' : 'khong_hoat_dong';
}

function getRoleInfo(role = '') {
  const normalized = role.toString().trim();
  const lower = normalized.toLowerCase();
  for (const variant of ROLE_VARIANTS) {
    if (variant.match.some((key) => lower.includes(key))) {
      return { bg: variant.bg, color: variant.color, label: variant.label };
    }
  }
  return { bg: '#f3f4f6', color: '#374151', label: normalized || 'Chưa xác định' };
}

