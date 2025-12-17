import React from 'react';
import {
  Users,
  Mail,
  GraduationCap,
  Calendar,
  User,
  Eye,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react';
import { getUserAvatar, getStudentAvatar } from '../../../../../shared/lib/avatar';

interface UserData {
  id: string;
  ho_ten?: string;
  ten_dn?: string;
  maso?: string;
  email?: string;
  trang_thai?: string;
  khoa?: boolean;
  ngay_tao?: string;
  vai_tro?: string | { id: string; ten_vt?: string; ten_vai_tro?: string };
  role?: string;
  avatar_url?: string;
  sinh_vien?: { mssv?: string; lop?: { ten_lop?: string };[key: string]: unknown };
  [key: string]: unknown;
}

// Helper to extract role name from vai_tro union type
function getRoleName(vaiTro: UserData['vai_tro']): string | undefined {
  if (!vaiTro) return undefined;
  if (typeof vaiTro === 'string') return vaiTro;
  return vaiTro.ten_vt || vaiTro.ten_vai_tro;
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

interface AdminUsersResultsProps {
  users?: UserData[];
  viewMode?: 'grid' | 'list';
  onViewDetails?: (user: UserData) => void;
  onLockUser?: (userId: string) => void;
  onUnlockUser?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  getDerivedStatus?: (user: UserData) => string;
  getStatusColor?: (status: string) => StatusColorResult;
  getRoleColor?: (role: string) => RoleColorResult;
  getDisplayRoleName?: (role: string) => string;
}

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500' as const,
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: '8px',
  transition: 'all 0.2s ease'
};

export default function AdminUsersResults({
  users = [],
  viewMode = 'grid',
  onViewDetails,
  onLockUser,
  onUnlockUser,
  onDeleteUser,
  getDerivedStatus,
  getStatusColor,
  getRoleColor,
  getDisplayRoleName
}: AdminUsersResultsProps): React.ReactElement {
  if (!users.length) {
    return (
      <div
        className={viewMode === 'grid' ? 'col-span-full' : ''}
        style={{
          textAlign: 'center',
          padding: '60px 24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}
      >
        <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#6b7280' }} />
        <p style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {users.map((user) => {
          const avatarInfo = user.sinh_vien ? getStudentAvatar(user.sinh_vien) : getUserAvatar(user);
          const derivedStatus = getDerivedStatus(user);
          const statusInfo = getStatusColor(derivedStatus);
          const roleInfo = getRoleColor(getRoleName(user.vai_tro));
          return (
            <div
              key={user.id}
              className="group relative bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg hover:border-violet-300 transition-all duration-200"
            >
              <div className="flex items-center gap-4 p-4">
                <UserAvatar avatarInfo={avatarInfo} borderColor={roleInfo.bg} />
                <UserListInfo
                  user={user}
                  statusInfo={statusInfo}
                  roleInfo={roleInfo}
                  getDisplayRoleName={getDisplayRoleName}
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onViewDetails(user)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Eye size={16} />
                    <span className="hidden sm:inline">Chi tiết</span>
                  </button>
                  {derivedStatus === 'khoa' ? (
                    <IconButton icon={<Unlock size={16} />} title="Mở khóa" bg="bg-emerald-500" hover="hover:bg-emerald-600" onClick={() => onUnlockUser(user.id)} />
                  ) : (
                    <IconButton icon={<Lock size={16} />} title="Khóa" bg="bg-amber-500" hover="hover:bg-amber-600" onClick={() => onLockUser(user.id)} />
                  )}
                  <IconButton icon={<Trash2 size={16} />} title="Xóa" bg="bg-rose-500" hover="hover:bg-rose-600" onClick={() => onDeleteUser(user.id)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {users.map((user) => {
        const avatarInfo = user.sinh_vien ? getStudentAvatar(user.sinh_vien) : getUserAvatar(user);
        const derivedStatus = getDerivedStatus(user);
        const statusInfo = getStatusColor(derivedStatus);
        const roleInfo = getRoleColor(getRoleName(user.vai_tro));
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
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <UserAvatar avatarInfo={avatarInfo} borderColor={roleInfo.bg} large />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                  {user.ho_ten || 'Chưa có tên'}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge label={getDisplayRoleName(getRoleName(user.vai_tro) || user.role)} colors={roleInfo} />
                  <Badge label={statusInfo.text} colors={statusInfo} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px', minHeight: '140px', flex: 1 }}>
              <InfoRow icon={<Mail size={14} />} text={user.email || 'Chưa có email'} />
              <InfoRow icon={<User size={14} />} text={user.ten_dn || 'Chưa có username'} />
              {user.sinh_vien && (
                <>
                  <InfoRow icon={<GraduationCap size={14} />} text={`MSSV: ${user.sinh_vien.mssv}`} />
                  {user.sinh_vien.lop && (
                    <InfoRow icon={<Users size={14} />} text={`Lớp: ${user.sinh_vien.lop.ten_lop}`} />
                  )}
                </>
              )}
              <InfoRow
                icon={<Calendar size={14} />}
                text={`Tham gia: ${user.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString('vi-VN') : 'Không xác định'}`}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', marginTop: 'auto' }}>
              <button
                type="button"
                onClick={() => onViewDetails(user)}
                style={{ ...buttonStyle, backgroundColor: '#3b82f6', color: 'white', flex: 1, justifyContent: 'center' }}
              >
                <Eye size={16} />
                Chi tiết
              </button>
              {derivedStatus === 'khoa' ? (
                <button
                  onClick={() => onUnlockUser(user.id)}
                  title="Mở khóa tài khoản"
                  style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white', padding: '8px 12px' }}
                >
                  <Unlock size={16} />
                </button>
              ) : (
                <button
                  onClick={() => onLockUser(user.id)}
                  title="Khóa tài khoản"
                  style={{ ...buttonStyle, backgroundColor: '#f59e0b', color: 'white', padding: '8px 12px' }}
                >
                  <Lock size={16} />
                </button>
              )}
              <button
                onClick={() => onDeleteUser(user.id)}
                title="Xóa tài khoản"
                style={{ ...buttonStyle, backgroundColor: '#ef4444', color: 'white', padding: '8px 12px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface UserAvatarProps {
  avatarInfo: { hasValidAvatar?: boolean; src?: string; alt?: string; fallback?: string };
  borderColor: string;
  large?: boolean;
}

function UserAvatar({ avatarInfo, borderColor, large = false }: UserAvatarProps) {
  const size = large ? 50 : 48;
  if (avatarInfo.hasValidAvatar) {
    return (
      <img
        src={avatarInfo.src}
        alt={avatarInfo.alt}
        className="rounded-full object-cover border-2"
        style={{ width: size, height: size, borderColor }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const next = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (next) next.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: borderColor,
        color: '#111'
      }}
    >
      {avatarInfo.fallback}
    </div>
  );
}

interface BadgeProps {
  label: string;
  colors: { bg: string; color: string };
}

function Badge({ label, colors }: BadgeProps) {
  return (
    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: colors.bg, color: colors.color }}>
      {label}
    </span>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  text: string;
}

function InfoRow({ icon, text }: InfoRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        fontSize: '14px',
        color: '#6b7280',
        minHeight: '24px'
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

interface UserListInfoProps {
  user: UserData;
  statusInfo: StatusColorResult;
  roleInfo: RoleColorResult;
  getDisplayRoleName: (role: string) => string;
}

function UserListInfo({ user, statusInfo, roleInfo, getDisplayRoleName }: UserListInfoProps) {
  return (
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
        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}>
          {getDisplayRoleName(getRoleName(user.vai_tro) || user.role)}
        </span>
        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
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
  );
}

interface IconButtonProps {
  icon: React.ReactNode;
  title: string;
  bg: string;
  hover: string;
  onClick: () => void;
}

function IconButton({ icon, title, bg, hover, onClick }: IconButtonProps) {
  return (
    <button onClick={onClick} title={title} className={`p-2 text-white rounded-lg transition-all ${bg} ${hover}`}>
      {icon}
    </button>
  );
}










