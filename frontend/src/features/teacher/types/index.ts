/**
 * Teacher Module TypeScript Types
 * ================================
 * Centralized type definitions for teacher feature
 * 
 * @module features/teacher/types
 */

import { Activity, Registration, User, ActivityStatus, RegistrationStatus } from '@/shared/types';

// ============ API RESPONSE TYPES ============

/**
 * Standardized API success response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Standardized API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code: number | null;
}

/**
 * Union type for API responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Type guard for checking successful API responses
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

// ============ ACTIVITY TYPES ============

/**
 * Extended activity with UI-specific fields
 */
export interface TeacherActivity extends Activity {
  hd_id?: string;
  diem_rl?: number;
  status?: string;
  nguoi_tao?: string;
  lop_id?: string;
  hinh_anh?: string[];
  tep_dinh_kem?: string[];
  hoat_dong?: Activity;
  loai_hd_id?: string;
  ngay_cap_nhat?: string;
  updated_at?: string;
  updatedAt?: string;
  ngay_tao?: string;
  createdAt?: string;
  don_vi_to_chuc?: string;
  loai?: string;
}

/**
 * Activity list response
 */
export interface ActivitiesListResponse {
  items: TeacherActivity[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Activity list params
 */
export interface ActivitiesListParams {
  page?: number;
  limit?: number | string;
  semester?: string;
  search?: string;
  status?: string;
}

// ============ APPROVAL TYPES ============

/**
 * Approval stats
 */
export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * Pending activities response
 */
export interface PendingActivitiesResponse {
  items: TeacherActivity[];
  stats: ApprovalStats;
}

/**
 * Approval history params
 */
export interface ApprovalHistoryParams {
  semester?: string;
  search?: string;
  status?: string;
}

// ============ REGISTRATION TYPES ============

/**
 * Extended registration with UI fields
 */
export interface TeacherRegistration extends Registration {
  ngay_duyet?: string;
  updated_at?: string;
  updatedAt?: string;
  tg_diem_danh?: string;
}

/**
 * Registration list response
 */
export interface RegistrationsListResponse {
  items: TeacherRegistration[];
  total: number;
  counts: {
    cho_duyet: number;
    da_duyet: number;
    tu_choi: number;
    da_tham_gia: number;
  };
}

// ============ DASHBOARD TYPES ============

/**
 * Dashboard summary stats
 */
export interface DashboardSummary {
  totalActivities: number;
  pendingApprovals: number;
  totalStudents: number;
  avgClassScore: number;
  participationRate: number;
  approvedThisWeek: number;
}

/**
 * Dashboard data response
 */
export interface DashboardData {
  summary?: DashboardSummary;
  pendingActivities?: TeacherActivity[];
  pendingRegistrations?: TeacherRegistration[];
  classes?: TeacherClass[];
  students?: TeacherStudent[];
  overview?: {
    avgPoints?: number;
    participationRate?: number;
  };
}

/**
 * Derived stats for dashboard
 */
export interface DerivedStats {
  totalActivities: number;
  pendingActivities: number;
  pendingRegistrations: number;
  approvedThisWeek: number;
  avgClassScore: number | null;
  participationRate: number | null;
}

/**
 * Dashboard params
 */
export interface DashboardParams {
  semester?: string;
  classId?: string;
}

// ============ CLASS TYPES ============

/**
 * Teacher class
 */
export interface TeacherClass {
  id: string;
  ten_lop: string;
  ma_lop?: string;
  so_sinh_vien?: number;
  lop_truong?: string;
  _count?: {
    sinh_viens?: number;
  };
}

// ============ STUDENT TYPES ============

/**
 * Teacher student
 */
export interface TeacherStudent {
  id: string;
  ho_ten?: string;
  email?: string;
  anh_dai_dien?: string;
  avatar?: string;
  diem_rl?: number;
  mssv?: string;
  sdt?: string;
  ngay_sinh?: string;
  gt?: string;
  dia_chi?: string;
  lop_id?: string;
  nguoi_dung?: {
    id?: string;
    ho_ten?: string;
    email?: string;
    anh_dai_dien?: string;
  };
  sinh_vien?: {
    mssv?: string;
    sdt?: string;
    lop?: {
      id?: string;
      ten_lop?: string;
    };
  };
}

/**
 * Student form data
 */
export interface StudentFormData {
  ho_ten: string;
  email: string;
  mssv: string;
  ngay_sinh: string;
  gt: string;
  lop_id: string;
  dia_chi: string;
  sdt: string;
  ten_dn: string;
  mat_khau: string;
}

/**
 * Student list params
 */
export interface StudentListParams {
  format?: string;
  search?: string;
  classFilter?: string;
  classId?: string;
}

// ============ STUDENT SCORES TYPES ============

/**
 * Student score
 */
export interface StudentScore {
  id: string;
  student_id?: string;
  semester?: string;
  total_points?: number;
  rank?: string;
  details?: ScoreDetail[];
}

/**
 * Score detail
 */
export interface ScoreDetail {
  activity_id: string;
  activity_name: string;
  points: number;
  earned_at: string;
}

/**
 * Student scores list response
 */
export interface StudentScoresListResponse {
  items: StudentScore[];
  total: number;
}

// ============ ATTENDANCE TYPES ============

/**
 * Attendance record
 */
export interface AttendanceRecord {
  id: string;
  activity_id?: string;
  student_id?: string;
  attended?: boolean;
  time?: string;
  note?: string;
}

// ============ HOOK OPTIONS TYPES ============

/**
 * Activities hook options
 */
export interface UseTeacherActivitiesOptions {
  initialSemester?: string;
  initialLimit?: string | number;
}

/**
 * Dashboard hook options
 */
export interface UseTeacherDashboardOptions {
  semester?: string;
  classId?: string;
}

/**
 * Approvals hook options
 */
export interface UseTeacherApprovalsOptions {
  initialSemester?: string;
}

// ============ SORTING TYPES ============

/**
 * Sort configuration
 */
export interface SortConfig {
  nameGetter?: (item: Record<string, unknown>) => string;
  pointsGetter?: (item: Record<string, unknown>) => number;
  dateFields?: string[];
}

// ============ COMPONENT PROPS TYPES ============

/**
 * Activity card inline props
 */
export interface TeacherActivityCardInlineProps {
  activity: TeacherActivity;
  viewMode: 'grid' | 'list';
  isWritable: boolean;
  onApprove: (id: string, name?: string) => void;
  onReject: (id: string, name?: string) => void;
  onViewDetail: (id: string) => void;
  onEdit?: (activity: TeacherActivity) => void;
  onDelete?: (id: string, name?: string) => void;
}

/**
 * Info row props
 */
export interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subLabel?: string;
}

/**
 * Action button props
 */
export interface ActionButtonProps {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  gradient?: string;
  variant?: 'outline' | 'danger';
  fullWidth?: boolean;
  disabled?: boolean;
  disabledTitle?: string;
}

/**
 * Student form modal props
 */
export interface StudentFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  formData: Partial<StudentFormData>;
  onFormChange: (data: Partial<StudentFormData>) => void;
  classes: TeacherClass[];
  onSubmit: () => void;
  onClose: () => void;
}

/**
 * Semester select props
 */
export interface SemesterSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  options: Array<{ value: string; label: string }>;
}

/**
 * Semester picker props
 */
export interface SemesterPickerProps {
  compact?: boolean;
  onChanged: (semester: string) => void;
  classId?: string;
  enableSoftLock?: boolean;
  enableHardLock?: boolean;
  className?: string;
  allowProposeWithoutClass?: boolean;
}

/**
 * Dashboard activity card props
 */
export interface DashboardActivityCardProps {
  activity: TeacherActivity;
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

/**
 * Bulk actions bar props
 */
export interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  processing: boolean;
}
