/**
 * Activity Status Utilities
 * DRY: Centralized status definitions and helpers
 */

// Type definitions
export type ActivityStatus = 'cho_duyet' | 'da_duyet' | 'tu_choi' | 'da_huy' | 'ket_thuc';
export type RegistrationStatus = 'cho_duyet' | 'da_duyet' | 'tu_choi' | 'da_tham_gia';

export interface StatusColorConfig {
  bg: string;
  text: string;
}

export interface StatusConfig {
  text: string;
  dot: string;
  label: string;
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface Activity {
  id: string;
  trang_thai?: string;
  ngay_bd?: string | Date;
  ngay_kt?: string | Date;
  han_dk?: string | Date;
  han_dang_ky?: string | Date;
  is_registered?: boolean;
  registration_status?: string;
}

/**
 * Status labels mapping
 */
export const STATUS_LABELS: Record<ActivityStatus, string> = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  da_huy: 'Đã hủy',
  ket_thuc: 'Kết thúc'
};

/**
 * Status colors for UI badges
 */
export const STATUS_COLORS: Record<ActivityStatus, StatusColorConfig> = {
  cho_duyet: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  da_duyet: { bg: 'bg-green-100', text: 'text-green-800' },
  tu_choi: { bg: 'bg-red-100', text: 'text-red-800' },
  da_huy: { bg: 'bg-gray-100', text: 'text-gray-800' },
  ket_thuc: { bg: 'bg-blue-100', text: 'text-blue-800' }
};

/**
 * Admin status colors
 */
export const ADMIN_STATUS_COLORS: Record<ActivityStatus, string> = {
  cho_duyet: 'bg-amber-50 text-amber-700 border-amber-200',
  da_duyet: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  tu_choi: 'bg-rose-50 text-rose-700 border-rose-200',
  da_huy: 'bg-slate-50 text-slate-700 border-slate-200',
  ket_thuc: 'bg-purple-50 text-purple-700 border-purple-200'
};

/**
 * Registration status configuration
 */
export const REGISTRATION_STATUS_CONFIG: Record<RegistrationStatus, StatusConfig> = {
  cho_duyet: { text: 'text-amber-700', dot: 'bg-amber-400', label: 'Chờ duyệt' },
  da_duyet: { text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Đã duyệt' },
  tu_choi: { text: 'text-rose-700', dot: 'bg-rose-400', label: 'Từ chối' },
  da_tham_gia: { text: 'text-blue-700', dot: 'bg-blue-400', label: 'Đã tham gia' }
};

/**
 * Activity status configuration
 */
export const ACTIVITY_STATUS_CONFIG: Record<string, StatusConfig> = {
  cho_duyet: { text: 'text-gray-700', dot: 'bg-gray-400', label: 'Chờ duyệt' },
  da_duyet: { text: 'text-green-700', dot: 'bg-green-400', label: 'Đã mở' },
  tu_choi: { text: 'text-red-700', dot: 'bg-red-400', label: 'Từ chối' },
  ket_thuc: { text: 'text-slate-700', dot: 'bg-slate-400', label: 'Kết thúc' }
};

/**
 * Activity status filter options
 */
export const ACTIVITY_STATUS_OPTIONS: StatusOption[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'open', label: '🟢 Đang mở đăng ký' },
  { value: 'soon', label: '🔵 Đang diễn ra' },
  { value: 'closed', label: '⚫ Đã kết thúc' }
];

/**
 * Admin status filter options
 */
export const ADMIN_STATUS_OPTIONS: StatusOption[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'cho_duyet', label: 'Chờ duyệt' },
  { value: 'da_duyet', label: 'Đã duyệt' },
  { value: 'tu_choi', label: 'Từ chối' },
  { value: 'da_huy', label: 'Đã hủy' },
  { value: 'ket_thuc', label: 'Kết thúc' }
];

/**
 * Gets status color configuration
 * @param status - Activity status
 * @returns Status color config with bg, text, and label
 */
export const getStatusColor = (status: string): StatusColorConfig & { label: string } => {
  const config = STATUS_COLORS[status as ActivityStatus];
  const label = STATUS_LABELS[status as ActivityStatus];
  
  if (!config) {
    return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Không xác định' };
  }
  
  return { ...config, label };
};

/**
 * Gets status badge configuration for activity
 * @param activity - Activity object
 * @returns Status configuration or null
 */
export const getStatusBadgeConfig = (activity: Activity): StatusConfig | null => {
  // Check if user has registered for this activity
  if (activity.is_registered && activity.registration_status) {
    return REGISTRATION_STATUS_CONFIG[activity.registration_status as RegistrationStatus] || null;
  }
  
  return ACTIVITY_STATUS_CONFIG[activity.trang_thai || ''] || null;
};

/**
 * Checks if activity is open for registration
 * @param activity - Activity object
 * @returns True if open for registration
 */
export const isOpenForRegistration = (activity: Activity): boolean => {
  const now = new Date();
  const deadline = activity.han_dk || activity.han_dang_ky;
  const deadlineDate = deadline ? new Date(deadline) : (activity.ngay_bd ? new Date(activity.ngay_bd) : null);
  
  return !!deadlineDate && 
         deadlineDate > now && 
         (activity.trang_thai === 'da_duyet' || activity.trang_thai === 'cho_duyet');
};

/**
 * Checks if user can register for activity
 * @param activity - Activity object
 * @param role - User role
 * @param isWritable - Whether user has write permission
 * @returns True if can register
 */
export const canRegisterForActivity = (activity: Activity, role: string, isWritable: boolean): boolean => {
  const now = new Date();
  const startDate = activity.ngay_bd ? new Date(activity.ngay_bd) : null;
  const endDate = activity.ngay_kt ? new Date(activity.ngay_kt) : startDate;
  const deadline = activity.han_dk ? new Date(activity.han_dk) : null;
  
  const isPast = endDate ? endDate < now : false;
  const isDeadlinePast = deadline ? deadline.getTime() < now.getTime() : false;
  const isAfterStart = startDate ? now.getTime() >= startDate.getTime() : false;
  
  const isTeacher = role === 'giang_vien' || role === 'teacher';
  const hasNotRegistered = !activity.is_registered || activity.registration_status === 'tu_choi';
  
  return activity.trang_thai === 'da_duyet' && 
         !isPast && 
         !isDeadlinePast && 
         !isAfterStart && 
         hasNotRegistered && 
         !isTeacher && 
         isWritable;
};
