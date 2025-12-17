/**
 * Points Repository Interface
 * Interface for points data access
 */

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

export interface PointsFilters {
  semester?: string;
}

export interface StudentWithDetails {
  id: string;
  mssv: string;
  nguoi_dung_id: string;
  lop_id: string | null;
  nguoi_dung?: {
    ho_ten: string | null;
    email: string | null;
  };
  lop?: {
    ten_lop: string;
    khoa: string | null;
    nien_khoa: string | null;
  };
}

export interface RegistrationWithActivity {
  id: string;
  sv_id: string;
  hd_id: string;
  trang_thai_dk: string;
  ngay_dang_ky: Date;
  ngay_duyet?: Date | null;
  ly_do_tu_choi?: string | null;
  ghi_chu?: string | null;
  hoat_dong?: {
    id: string;
    ten_hd: string;
    mo_ta?: string | null;
    diem_rl?: number | null;
    ngay_bd: Date;
    ngay_kt?: Date | null;
    dia_diem?: string | null;
    hoc_ky?: string | null;
    nam_hoc?: string | null;
    trang_thai: string;
    loai_hd?: {
      id: string;
      ten_loai_hd: string;
      diem_mac_dinh?: number | null;
      diem_toi_da?: number | null;
      mau_sac?: string | null;
    } | null;
  };
}

export interface AttendanceWithDetails {
  id: string;
  sv_id: string;
  hd_id: string;
  tg_diem_danh: Date;
  phuong_thuc?: string | null;
  trang_thai_tham_gia?: string | null;
  ghi_chu?: string | null;
  hoat_dong: {
    id: string;
    ten_hd: string;
    diem_rl?: number | null;
    loai_hd?: {
      ten_loai_hd: string;
      diem_mac_dinh?: number | null;
    } | null;
  };
  nguoi_diem_danh: {
    ho_ten: string;
    email?: string | null;
  };
}

export interface StatusCount {
  trang_thai_dk: string;
  _count: {
    id: number;
  };
}

export interface IPointsRepository {
  findStudentByUserId(userId: string): Promise<StudentWithDetails | null>;
  findAttendedRegistrations(studentId: string, filters?: PointsFilters): Promise<RegistrationWithActivity[]>;
  findAllRegistrations(studentId: string): Promise<RegistrationWithActivity[]>;
  getRegistrationStatusCounts(studentId: string): Promise<StatusCount[]>;
  findRegistrationsWithPagination(
    studentId: string,
    filters: PointsFilters,
    pagination: PaginationParams
  ): Promise<{ registrations: RegistrationWithActivity[]; total: number }>;
  findAttendanceRecords(
    studentId: string,
    pagination: PaginationParams
  ): Promise<{ attendances: AttendanceWithDetails[]; total: number }>;
  getUniqueSemesters(studentId: string): Promise<(string | null)[]>;
  getUniqueAcademicYears(studentId: string): Promise<(string | null)[]>;
  findCompletedRegistrationsForSemester(
    studentId: string,
    hocKy: string,
    namHoc?: string | null
  ): Promise<RegistrationWithActivity[]>;
}
