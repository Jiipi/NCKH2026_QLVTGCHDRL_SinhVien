/**
 * Shared Activity Mappers
 * Consolidated mapper functions for activity data transformation
 */

/**
 * Extract approver role from nguoi_duyet object
 * @param nguoiDuyet - The nguoi_duyet object from API
 * @returns Role string like 'GIANG_VIEN', 'LOP_TRUONG', etc.
 */
export function extractApproverRole(nguoiDuyet: Record<string, unknown> | null | undefined): string | null {
  if (!nguoiDuyet) return null;
  // Try to get role from vai_tro.ten_vt (Prisma field name)
  const vaiTro = nguoiDuyet.vai_tro as Record<string, unknown> | undefined;
  const roleName = vaiTro?.ten_vt as string | undefined;
  if (roleName) {
    // Map common role names to role codes
    const roleMap: Record<string, string> = {
      'Giảng viên': 'GIANG_VIEN',
      'GIANG_VIEN': 'GIANG_VIEN',
      'Lớp trưởng': 'LOP_TRUONG',
      'LOP_TRUONG': 'LOP_TRUONG',
      'Admin': 'ADMIN',
      'ADMIN': 'ADMIN',
      'Sinh viên': 'SINH_VIEN',
      'SINH_VIEN': 'SINH_VIEN'
    };
    return roleMap[roleName] || roleName;
  }
  return null;
}

/**
 * Normalize array field (images, attachments, etc.)
 * @param value - Raw value from API
 * @returns Normalized array
 */
export function normalizeArrayField(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

/**
 * Map activity registration status từ API sang UI format (student view)
 */
export function mapRegistrationStatusStudent(status: unknown): string {
  const statusMap: Record<string, string> = {
    'cho_duyet': 'pending',
    'da_duyet': 'approved',
    'da_tham_gia': 'joined',
    'tu_choi': 'rejected',
    'pending': 'pending',
    'approved': 'approved',
    'participated': 'joined',
    'attended': 'joined',
    'rejected': 'rejected'
  };
  
  const normalized = String(status || '').toLowerCase();
  return statusMap[normalized] || 'pending';
}

/**
 * Map activity status từ API sang UI format (teacher view)
 */
export function mapActivityStatus(status: unknown): string {
  const statusMap: Record<string, string> = {
    'cho_duyet': 'pending',
    'da_duyet': 'approved',
    'tu_choi': 'rejected',
    'ket_thuc': 'completed',
    'da_huy': 'rejected',
    'pending': 'pending',
    'approved': 'approved',
    'rejected': 'rejected',
    'dang_dien_ra': 'ongoing',
    'da_ket_thuc': 'completed',
    'completed': 'completed'
  };
  
  const normalized = String(status || '').toLowerCase();
  return statusMap[normalized] || 'pending';
}

/**
 * Map registration status từ API sang UI format (monitor view - keeps Vietnamese)
 */
export function mapRegistrationStatusMonitor(status: unknown): string {
  const statusMap: Record<string, string> = {
    'cho_duyet': 'cho_duyet',
    'da_duyet': 'da_duyet',
    'da_tham_gia': 'da_tham_gia',
    'tu_choi': 'tu_choi',
    'pending': 'cho_duyet',
    'approved': 'da_duyet',
    'participated': 'da_tham_gia',
    'attended': 'da_tham_gia',
    'rejected': 'tu_choi'
  };
  
  const normalized = String(status || '').toLowerCase();
  return statusMap[normalized] || 'cho_duyet';
}

/**
 * Map attendance status từ API sang UI format
 */
export function mapAttendanceStatus(status: unknown): string {
  const statusMap: Record<string, string> = {
    'co_mat': 'present',
    'vang': 'absent',
    'co_phep': 'excused',
    'present': 'present',
    'absent': 'absent',
    'excused': 'excused'
  };
  
  const normalized = String(status || '').toLowerCase();
  return statusMap[normalized] || 'absent';
}

/** Known shape of loai_hd when it's an object */
interface LoaiHdObject {
  id?: string;
  ten_loai_hd?: string;
  name?: string;
  [key: string]: unknown;
}

export interface MappedActivity {
  id: string | number;
  hd_id: string | number;
  ten_hd: string;
  mo_ta: string | null;
  loai_hd: LoaiHdObject | string | null;
  loai_hd_id?: string | null;
  diem_rl: number;
  ngay_bd: string | null;
  ngay_kt: string | null;
  ngay_tao?: string | null;
  ngay_cap_nhat?: string | null;
  dia_diem: string | null;
  trang_thai?: string | null;
  trang_thai_dk?: string | null;
  status?: string;
  ngay_dang_ky?: string | null;
  ngay_duyet?: string | null;
  ly_do_tu_choi?: string | null;
  hinh_anh: unknown[];
  tep_dinh_kem: unknown[];
  is_class_activity?: boolean;
  nguoi_tao?: Record<string, unknown> | null;
  lop_id?: string | null;
  registeredStudents?: number;
  hoat_dong?: Record<string, unknown>;
  // Additional fields for various use cases
  han_dk?: string | null;
  sl_toi_da?: number | null;
  so_luong_toi_da?: number | null;
  don_vi_to_chuc?: string | null;
  yeu_cau_tham_gia?: string | null;
  is_registered?: boolean;
  registration_status?: string;
  registrationCount?: number;
  so_dang_ky?: number;
  _count?: { dang_ky_hd?: number };
  updated_at?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

/**
 * Map activity data từ API sang UI format (base mapper)
 * This is the consolidated version used by all features
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapActivityToUI(activity: Record<string, any>): MappedActivity {
  const activityData = activity.hoat_dong || activity;
  
  // Process images - normalize to array
  const rawImages = activityData.hinh_anh || activity.hinh_anh || [];
  const hinh_anh = normalizeArrayField(rawImages);
  
  // Process attachments - normalize to array
  const rawAttachments = activityData.tep_dinh_kem || activity.tep_dinh_kem || [];
  const tep_dinh_kem = normalizeArrayField(rawAttachments);
  
  return {
    id: activity.id || activity.hd_id || activityData.id,
    hd_id: activity.hd_id || activity.id || activityData.id,
    ten_hd: activityData.ten_hd || activityData.name || activity.ten_hd || 'Hoạt động',
    mo_ta: activityData.mo_ta || activityData.description || activity.mo_ta,
    loai_hd: activityData.loai_hd || activityData.loai || activity.loai_hd,
    loai_hd_id: activityData.loai_hd_id || activity.loai_hd_id,
    diem_rl: activityData.diem_rl || activity.diem_rl || activityData.diem || 0,
    ngay_bd: activityData.ngay_bd || activity.ngay_bd,
    ngay_kt: activityData.ngay_kt || activity.ngay_kt,
    ngay_tao: activityData.ngay_tao || activity.ngay_tao || activityData.createdAt || activity.createdAt,
    ngay_cap_nhat: activityData.ngay_cap_nhat || activity.ngay_cap_nhat || activityData.updatedAt || activity.updatedAt,
    dia_diem: activityData.dia_diem || activity.dia_diem || activityData.location,
    trang_thai: activity.trang_thai || activityData.trang_thai,
    trang_thai_dk: activity.trang_thai_dk || activity.status || activityData.trang_thai_dk,
    ngay_dang_ky: activity.ngay_dang_ky || activity.createdAt,
    ngay_duyet: activity.ngay_duyet,
    ly_do_tu_choi: activity.ly_do_tu_choi,
    hinh_anh: hinh_anh,
    tep_dinh_kem: tep_dinh_kem,
    is_class_activity: activity.is_class_activity !== false,
    nguoi_tao: activity.nguoi_tao || activityData.nguoi_tao,
    lop_id: activity.lop_id || activityData.lop_id,
    registeredStudents: activity.registeredStudents || activity._count?.dang_ky_hd || 0,
    hoat_dong: activityData
  };
}

export interface GroupedActivities {
  pending: MappedActivity[];
  approved: MappedActivity[];
  joined: MappedActivity[];
  rejected: MappedActivity[];
  ongoing?: MappedActivity[];
  completed?: MappedActivity[];
  all: MappedActivity[];
}

/**
 * Group activities by status (student view)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupActivitiesByStatusStudent(activities: Record<string, any>[]): GroupedActivities {
  const pending: MappedActivity[] = [];
  const approved: MappedActivity[] = [];
  const joined: MappedActivity[] = [];
  const rejected: MappedActivity[] = [];
  const all: MappedActivity[] = [];

  activities.forEach(activity => {
    const mapped = mapActivityToUI(activity);
    mapped.status = mapRegistrationStatusStudent(mapped.trang_thai_dk);
    
    all.push(mapped);
    
    switch (mapped.status) {
      case 'pending':
        pending.push(mapped);
        break;
      case 'approved':
        approved.push(mapped);
        break;
      case 'joined':
        joined.push(mapped);
        break;
      case 'rejected':
        rejected.push(mapped);
        break;
      default:
        pending.push(mapped);
    }
  });

  return { pending, approved, joined, rejected, all };
}

/**
 * Group activities by status (teacher view)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupActivitiesByStatusTeacher(activities: Record<string, any>[]): GroupedActivities {
  const pending: MappedActivity[] = [];
  const approved: MappedActivity[] = [];
  const joined: MappedActivity[] = [];
  const rejected: MappedActivity[] = [];
  const ongoing: MappedActivity[] = [];
  const completed: MappedActivity[] = [];
  const all: MappedActivity[] = [];

  activities.forEach(activity => {
    const mapped = mapActivityToUI(activity);
    mapped.status = mapActivityStatus(mapped.trang_thai);
    
    all.push(mapped);
    
    switch (mapped.status) {
      case 'pending':
        pending.push(mapped);
        break;
      case 'approved':
        approved.push(mapped);
        break;
      case 'rejected':
        rejected.push(mapped);
        break;
      case 'ongoing':
        ongoing.push(mapped);
        break;
      case 'completed':
        completed.push(mapped);
        break;
      default:
        pending.push(mapped);
    }
  });

  return { pending, approved, joined, rejected, ongoing, completed, all };
}
