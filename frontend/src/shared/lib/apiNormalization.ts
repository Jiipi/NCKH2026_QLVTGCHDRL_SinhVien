// Utility functions to normalize various API responses to the shape expected by legacy UI code
// Centralizing this prevents scattered fragile optional-chaining logic everywhere.

// Type definitions for API normalization
interface RawUser {
  id?: string;
  maso?: string;
  ten_dn?: string;
  hoten?: string;
  ho_ten?: string;
  email?: string;
  trang_thai?: string;
  trangThai?: string;
  status?: string;
  state?: string;
  is_locked?: boolean;
  bi_khoa?: boolean;
  khoa?: boolean;
  locked_at?: string;
  is_active?: boolean;
  kich_hoat?: boolean;
  last_active?: string;
  lastActive?: string;
  last_login?: string;
  lastLogin?: string;
  loggedAt?: string;
  vai_tro_id?: string;
  roleId?: string;
  vai_tro?: { ten_vt?: string; quyen_han?: unknown[] };
  role?: string;
  sinh_vien?: {
    lop?: { ten_lop?: string; khoa?: string };
    sdt?: string;
    anh_dai_dien?: string;
    avatar?: string;
  };
  lop?: string;
  sdt?: string;
  anh_dai_dien?: string;
  avatar?: string;
  profile_image?: string;
  hinh_anh?: string;
  hinh_dai_dien?: string;
  image?: string;
  photo?: string;
  avatar_url?: string;
  so_lop_cn?: number;
  so_hd_tao?: number;
  quyen_count?: number;
  ngay_tao?: string;
  createdAt?: string;
  _count?: { lops_chu_nhiem?: number; hoat_dong_tao?: number };
}

interface NormalizedUser {
  id?: string;
  ten_dn: string;
  ho_ten: string;
  email: string;
  trang_thai: string | undefined;
  vai_tro_id: string | null;
  vai_tro: { ten_vt?: string; quyen_han?: unknown[] };
  sinh_vien: RawUser['sinh_vien'] | null;
  maso: string;
  hoten: string;
  role: string;
  lop: string;
  khoa: string;
  sdt: string;
  anh_dai_dien: string | undefined;
  so_lop_cn: number;
  so_hd_tao: number;
  quyen_count: number | undefined;
  ngay_tao: string | null;
  original: RawUser;
}

interface UsersContainer {
  data?: { users?: RawUser[] };
  users?: RawUser[];
}

interface AxiosResponse {
  data?: {
    success?: boolean;
    message?: string;
    data?: {
      users?: RawUser[];
      items?: RawUser[];
      activities?: RawActivity[];
      roles?: RawRole[];
      attendance?: RawAttendance[];
      registrations?: RawRegistration[];
      activityTypes?: RawActivityType[];
      notifications?: RawNotification[];
    };
    users?: RawUser[];
    activities?: RawActivity[];
    roles?: RawRole[];
    attendance?: RawAttendance[];
    registrations?: RawRegistration[];
    activityTypes?: RawActivityType[];
    notifications?: RawNotification[];
  };
}

interface RawActivity {
  ten_hd?: string;
  name?: string;
  ma_hd?: string;
  code?: string;
  trang_thai?: string;
  status?: string;
  diem_rl?: number;
  points?: number;
  loai_hd?: unknown;
  activity_type?: unknown;
}

interface RawRole {
  id?: string;
  ten_vai_tro?: string;
  ten_vt?: string;
  name?: string;
  trang_thai?: string;
  status?: string;
  quyen_han?: unknown[];
  permissions?: unknown[];
  mau_sac?: string;
  color?: string;
  uu_tien?: number;
  priority?: number;
}

interface RawAttendance {
  trang_thai?: string;
  status?: string;
  thoi_gian_diem_danh?: string;
  tg_diem_danh?: string;
  timestamp?: string;
  hoat_dong?: unknown;
  activity?: unknown;
  sinh_vien?: unknown;
  student?: unknown;
}

interface RawRegistration {
  trang_thai?: string;
  status?: string;
  hoat_dong?: unknown;
  activity?: unknown;
  sinh_vien?: unknown;
  student?: unknown;
}

interface RawActivityType {
  ten_loai_hd?: string;
  name?: string;
  ma_loai?: string;
  code?: string;
  trang_thai?: string;
  status?: string;
}

interface RawNotification {
  tieu_de?: string;
  title?: string;
  noi_dung?: string;
  content?: string;
  trang_thai?: string;
  status?: string;
}

/**
 * Normalize users list returned by /admin/users endpoint.
 * Backend shape: { success, message, data: { users: [ { id, maso, hoten, email, role, lop, khoa, sdt, trang_thai, ngay_tao, sinh_vien } , ...], pagination } }
 * Existing UI expects (historically): { ten_dn, ho_ten, vai_tro: { ten_vt }, trang_thai, sinh_vien, ... }
 * We map the new flattened keys back while still exposing the original keys for any newer code.
 */
export function normalizeUsersResponse(apiResponse: UsersContainer | null | undefined): NormalizedUser[] {
  if (!apiResponse) return [];
  // Accept already-extracted data segment or full axios response.data
  const container = apiResponse.data?.users ? apiResponse.data : apiResponse;
  const rawUsers = container.users || [];
  if (!Array.isArray(rawUsers)) return [];

  return rawUsers.map((u: RawUser): NormalizedUser => {

    // ---- Robust status mapping ----
    const statusRaw = u.trang_thai ?? u.trangThai ?? u.status ?? u.state;
    // Booleans or flags
    const isLocked = u.is_locked === true || u.bi_khoa === true || u.khoa === true || !!u.locked_at;
    const isActiveFlag = u.is_active === true || u.kich_hoat === true;
    let trang_thai;
    if (isLocked) {
      trang_thai = 'khoa';
    } else if (typeof statusRaw === 'string') {
      const s = statusRaw.toLowerCase();
      if (['khoa', 'locked', 'bi_khoa', 'disabled', 'suspended'].includes(s)) trang_thai = 'khoa';
      else if (['hoat_dong', 'active', 'online'].includes(s)) trang_thai = 'hoat_dong';
      else if (['khong_hoat_dong', 'inactive', 'offline'].includes(s)) trang_thai = 'khong_hoat_dong';
      else trang_thai = undefined;
    } else if (isActiveFlag) {
      trang_thai = 'hoat_dong';
    }
    // Derive from recent activity if still undefined
    if (!trang_thai) {
      const lastActive = u.last_active || u.lastActive || u.last_login || u.lastLogin || u.loggedAt;
      if (lastActive) {
        const t = new Date(lastActive).getTime();
        const now = Date.now();
        // Consider active if within last 15 minutes
        trang_thai = !isNaN(t) && (now - t) <= 15 * 60 * 1000 ? 'hoat_dong' : 'khong_hoat_dong';
      } else {
        // Safe default: not active
        trang_thai = 'khong_hoat_dong';
      }
    }

    return {
      // Legacy fields
      id: u.id,
      ten_dn: u.maso || u.ten_dn || '',
      ho_ten: u.hoten || u.ho_ten || '',
      email: u.email || '',
      trang_thai,
      vai_tro_id: u.vai_tro_id || u.roleId || null, // ✅ CRITICAL: Map vai_tro_id for role filtering
      vai_tro: u.vai_tro || { ten_vt: u.role || 'Sinh viên' }, // Keep full vai_tro object if present
      sinh_vien: u.sinh_vien || null,
      // Additional convenience / original fields
      maso: u.maso || u.ten_dn || '',
      hoten: u.hoten || u.ho_ten || '',
      role: u.role || u.vai_tro?.ten_vt || 'Sinh viên',
      lop: u.lop || u.sinh_vien?.lop?.ten_lop || '',
      khoa: (typeof u.khoa === 'string' ? u.khoa : null) || u.sinh_vien?.lop?.khoa || '',
      sdt: u.sdt || u.sinh_vien?.sdt || '',
      // Likely avatar fields (surface for consumers)
      anh_dai_dien: u.anh_dai_dien || u.avatar || u.profile_image || u.hinh_anh || u.hinh_dai_dien || u.image || u.photo || u.avatar_url || u.sinh_vien?.anh_dai_dien || u.sinh_vien?.avatar,
      // New backend enrichments for non-students
      so_lop_cn: u.so_lop_cn ?? u._count?.lops_chu_nhiem ?? 0,
      so_hd_tao: u.so_hd_tao ?? u._count?.hoat_dong_tao ?? 0,
      quyen_count: u.quyen_count ?? (Array.isArray(u.vai_tro?.quyen_han) ? u.vai_tro.quyen_han.length : undefined),
      ngay_tao: u.ngay_tao || u.createdAt || null,
      original: u
    };
  });
}

export function extractUsersFromAxiosResponse(axiosResponse: AxiosResponse | null | undefined): NormalizedUser[] {
  // axiosResponse.data is envelope { success, message, data, statusCode }
  const envelope = axiosResponse?.data;
  const usersArray = envelope?.data?.users || envelope?.data?.items; // Preferred paths (users list or generic items)
  if (Array.isArray(usersArray)) return normalizeUsersResponse({ users: usersArray });
  // Fallbacks for previous experimental shapes
  if (Array.isArray(envelope?.users)) return normalizeUsersResponse({ users: envelope.users });
  return [];
}

// -------- Activities Normalization --------
interface ActivitiesContainer {
  activities?: RawActivity[];
  data?: { activities?: RawActivity[] };
}

export function normalizeActivitiesResponse(container: ActivitiesContainer | RawActivity[] | null | undefined): RawActivity[] {
  if (!container) return [];
  const raw = (container as ActivitiesContainer).activities || (container as ActivitiesContainer).data?.activities || container;
  const list = (raw as ActivitiesContainer).activities && Array.isArray((raw as ActivitiesContainer).activities)
    ? (raw as ActivitiesContainer).activities!
    : Array.isArray(raw) ? raw : [];
  return list.map((a: RawActivity) => ({
    ...a,
    // Ensure expected fields exist with safe fallbacks
    ten_hd: a.ten_hd || a.name || '',
    ma_hd: a.ma_hd || a.code || '',
    trang_thai: a.trang_thai || a.status || 'cho_duyet',
    diem_rl: a.diem_rl ?? a.points ?? 0,
    loai_hd: a.loai_hd || a.activity_type || null
  }));
}

export function extractActivitiesFromAxiosResponse(resp: AxiosResponse | null | undefined): RawActivity[] {
  const envelope = resp?.data;
  const dataNode = envelope?.data;
  const arr = dataNode?.activities || dataNode?.items || envelope?.activities;
  if (Array.isArray(arr)) return normalizeActivitiesResponse({ activities: arr as RawActivity[] });
  return normalizeActivitiesResponse(dataNode as ActivitiesContainer | undefined);
}

// -------- Roles Normalization --------
interface RolesContainer {
  roles?: RawRole[];
  data?: { roles?: RawRole[] };
}

export function normalizeRolesResponse(container: RolesContainer | RawRole[] | null | undefined): RawRole[] {
  if (!container) return [];
  const raw = (container as RolesContainer).roles || (container as RolesContainer).data?.roles || container;
  const list = (raw as RolesContainer).roles && Array.isArray((raw as RolesContainer).roles)
    ? (raw as RolesContainer).roles!
    : Array.isArray(raw) ? raw : [];
  return list.map((r: RawRole) => ({
    ...r,
    id: r.id,
    ten_vai_tro: r.ten_vai_tro || r.ten_vt || r.name || '',
    ten_vt: r.ten_vt || r.ten_vai_tro || r.name || '',
    trang_thai: r.trang_thai || r.status || 'kich_hoat',
    quyen_han: Array.isArray(r.quyen_han) ? r.quyen_han : (Array.isArray(r.permissions) ? r.permissions : []),
    mau_sac: r.mau_sac || r.color || '#3b82f6',
    uu_tien: r.uu_tien ?? r.priority ?? 1
  }));
}

export function extractRolesFromAxiosResponse(resp: AxiosResponse | null | undefined): RawRole[] {
  const envelope = resp?.data;
  const arr = envelope?.data?.roles || envelope?.data?.items || envelope?.roles;
  if (Array.isArray(arr)) return normalizeRolesResponse({ roles: arr as RawRole[] });
  return normalizeRolesResponse(envelope?.data as RolesContainer | undefined);
}

// -------- Attendance Normalization --------
interface AttendanceContainer {
  attendance?: RawAttendance[];
  data?: { attendance?: RawAttendance[] };
}

export function normalizeAttendanceResponse(container: AttendanceContainer | RawAttendance[] | null | undefined): RawAttendance[] {
  if (!container) return [];
  const raw = (container as AttendanceContainer).attendance || (container as AttendanceContainer).data?.attendance || container;
  const list = (raw as AttendanceContainer).attendance && Array.isArray((raw as AttendanceContainer).attendance)
    ? (raw as AttendanceContainer).attendance!
    : Array.isArray(raw) ? raw : [];
  return list.map((rec: RawAttendance) => ({
    ...rec,
    trang_thai: rec.trang_thai || rec.status || 'co_mat',
    thoi_gian_diem_danh: rec.thoi_gian_diem_danh || rec.tg_diem_danh || rec.timestamp || null,
    hoat_dong: rec.hoat_dong || rec.activity || null,
    sinh_vien: rec.sinh_vien || rec.student || null
  }));
}

export function extractAttendanceFromAxiosResponse(resp: AxiosResponse | null | undefined): RawAttendance[] {
  const envelope = resp?.data;
  const arr = envelope?.data?.attendance || envelope?.data?.items || envelope?.attendance;
  if (Array.isArray(arr)) return normalizeAttendanceResponse({ attendance: arr as RawAttendance[] });
  return normalizeAttendanceResponse(envelope?.data as AttendanceContainer | undefined);
}

// -------- Registrations Normalization --------
interface RegistrationsContainer {
  registrations?: RawRegistration[];
  data?: { registrations?: RawRegistration[] };
}

export function normalizeRegistrationsResponse(container: RegistrationsContainer | RawRegistration[] | null | undefined): RawRegistration[] {
  if (!container) return [];
  const raw = (container as RegistrationsContainer).registrations || (container as RegistrationsContainer).data?.registrations || container;
  const list = (raw as RegistrationsContainer).registrations && Array.isArray((raw as RegistrationsContainer).registrations)
    ? (raw as RegistrationsContainer).registrations!
    : Array.isArray(raw) ? raw : [];
  return list.map((r: RawRegistration) => ({
    ...r,
    trang_thai: r.trang_thai || r.status || 'cho_duyet',
    hoat_dong: r.hoat_dong || r.activity || null,
    sinh_vien: r.sinh_vien || r.student || null
  }));
}

export function extractRegistrationsFromAxiosResponse(resp: AxiosResponse | null | undefined): RawRegistration[] {
  const envelope = resp?.data;
  const arr = envelope?.data?.registrations || envelope?.data?.items || envelope?.registrations;
  if (Array.isArray(arr)) return normalizeRegistrationsResponse({ registrations: arr as RawRegistration[] });
  return normalizeRegistrationsResponse(envelope?.data as RegistrationsContainer | undefined);
}

// -------- Activity Types Normalization --------
interface ActivityTypesContainer {
  activityTypes?: RawActivityType[];
  data?: { activityTypes?: RawActivityType[] };
}

export function normalizeActivityTypesResponse(container: ActivityTypesContainer | RawActivityType[] | null | undefined): RawActivityType[] {
  if (!container) return [];
  const raw = (container as ActivityTypesContainer).activityTypes || (container as ActivityTypesContainer).data?.activityTypes || container;
  const list = (raw as ActivityTypesContainer).activityTypes && Array.isArray((raw as ActivityTypesContainer).activityTypes)
    ? (raw as ActivityTypesContainer).activityTypes!
    : Array.isArray(raw) ? raw : [];
  return list.map((t: RawActivityType) => ({
    ...t,
    ten_loai_hd: t.ten_loai_hd || t.name || '',
    ma_loai: t.ma_loai || t.code || '',
    trang_thai: t.trang_thai || t.status || 'kich_hoat'
  }));
}

export function extractActivityTypesFromAxiosResponse(resp: AxiosResponse | null | undefined): RawActivityType[] {
  const envelope = resp?.data;
  const arr = envelope?.data?.activityTypes || envelope?.data?.items || envelope?.activityTypes;
  if (Array.isArray(arr)) return normalizeActivityTypesResponse({ activityTypes: arr as RawActivityType[] });
  return normalizeActivityTypesResponse(envelope?.data as ActivityTypesContainer | undefined);
}

// -------- Notifications Normalization --------
interface NotificationsContainer {
  notifications?: RawNotification[];
  data?: { notifications?: RawNotification[] };
}

export function normalizeNotificationsResponse(container: NotificationsContainer | RawNotification[] | null | undefined): RawNotification[] {
  if (!container) return [];
  const raw = (container as NotificationsContainer).notifications || (container as NotificationsContainer).data?.notifications || container;
  const list = (raw as NotificationsContainer).notifications && Array.isArray((raw as NotificationsContainer).notifications)
    ? (raw as NotificationsContainer).notifications!
    : Array.isArray(raw) ? raw : [];
  return list.map((n: RawNotification) => ({
    ...n,
    tieu_de: n.tieu_de || n.title || '',
    noi_dung: n.noi_dung || n.content || '',
    trang_thai: n.trang_thai || n.status || 'draft'
  }));
}

export function extractNotificationsFromAxiosResponse(resp: AxiosResponse | null | undefined): RawNotification[] {
  const envelope = resp?.data;
  const arr = envelope?.data?.notifications || envelope?.data?.items || envelope?.notifications;
  if (Array.isArray(arr)) return normalizeNotificationsResponse({ notifications: arr as RawNotification[] });
  return normalizeNotificationsResponse(envelope?.data as NotificationsContainer | undefined);
}

// -------- Reports Normalization (generic list or object) --------
interface ReportsContainer {
  activities?: unknown[] | { data?: unknown[] };
  users?: unknown[] | { data?: unknown[] };
  registrations?: unknown[] | { data?: unknown[] };
  attendance?: unknown[] | { data?: unknown[] };
  [key: string]: unknown;
}

export function normalizeReportsResponse<T extends ReportsContainer | null | undefined>(container: T): T {
  if (!container) return container;
  // Often reports are objects with aggregates; just return as-is but ensure arrays within are arrays.
  const clone = { ...container } as ReportsContainer;
  (['activities', 'users', 'registrations', 'attendance'] as const).forEach(k => {
    const val = clone[k];
    if (val && !Array.isArray(val)) {
      const valObj = val as { data?: unknown[] };
      clone[k] = Array.isArray(valObj.data) ? valObj.data : []; // fallback
    }
  });
  return clone as T;
}

export function extractReportsFromAxiosResponse(resp: AxiosResponse | null | undefined): ReportsContainer | null | undefined {
  const envelope = resp?.data;
  return normalizeReportsResponse((envelope?.data || envelope) as ReportsContainer | null | undefined);
}
