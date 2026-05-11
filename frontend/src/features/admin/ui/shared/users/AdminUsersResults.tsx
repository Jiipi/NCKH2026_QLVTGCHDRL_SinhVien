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
      <div className={`rounded-[2rem] border border-dashed border-white/60 bg-white/60 px-6 py-16 text-center shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60 ${viewMode === 'grid' ? 'col-span-full' : ''}`}>
        <Users className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Không tìm thấy người dùng nào</p>
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
              className="group relative rounded-[1.5rem] border border-white/60 bg-white/60 shadow-sm backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200/70 hover:bg-white/75 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-white/10"
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
                    className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
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
            className="flex min-h-[280px] flex-col rounded-[1.5rem] border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:border-indigo-200/70 hover:bg-white/75 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-white/10"
          >
            <div className="mb-4 flex items-center gap-3">
              <UserAvatar avatarInfo={avatarInfo} borderColor={roleInfo.bg} large />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-bold text-slate-950 dark:text-white">
                  {user.ho_ten || 'Chưa có tên'}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge label={getDisplayRoleName(getRoleName(user.vai_tro) || user.role)} colors={roleInfo} />
                  <Badge label={statusInfo.text} colors={statusInfo} />
                </div>
              </div>
            </div>

            <div className="mb-4 min-h-[140px] flex-1">
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

            <div className="mt-auto flex gap-2 border-t border-white/60 pt-4 dark:border-white/10">
              <button
                type="button"
                onClick={() => onViewDetails(user)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <Eye size={16} />
                Chi tiết
              </button>
              {derivedStatus === 'khoa' ? (
                <button
                  onClick={() => onUnlockUser(user.id)}
                  title="Mở khóa tài khoản"
                  className="rounded-2xl bg-emerald-500 px-3 py-2 text-white shadow-sm transition-colors hover:bg-emerald-600"
                >
                  <Unlock size={16} />
                </button>
              ) : (
                <button
                  onClick={() => onLockUser(user.id)}
                  title="Khóa tài khoản"
                  className="rounded-2xl bg-amber-500 px-3 py-2 text-white shadow-sm transition-colors hover:bg-amber-600"
                >
                  <Lock size={16} />
                </button>
              )}
              <button
                onClick={() => onDeleteUser(user.id)}
                title="Xóa tài khoản"
                className="rounded-2xl bg-rose-500 px-3 py-2 text-white shadow-sm transition-colors hover:bg-rose-600"
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
    <div className="mb-2 flex min-h-6 items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <span className="flex-shrink-0 text-slate-400 dark:text-slate-500">{icon}</span>
      <span className="truncate">{text}</span>
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
        <h3 className="truncate text-base font-bold text-slate-950 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
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










