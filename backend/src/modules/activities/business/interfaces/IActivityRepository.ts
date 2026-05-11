/**
 * IActivityRepository Interface
 * Contract for activity data access
 * Follows Dependency Inversion Principle (DIP)
 */

import type { HoatDong, Prisma, DangKyHoatDong, DiemDanh } from '@prisma/client';

export interface ActivityStudentIdentity {
  id: string;
  lop_id?: string | null;
}

export interface ActivityTeacherClassIdentity {
  id: string;
}

export interface ActivityAttendanceCreateData {
  nguoi_diem_danh_id: string;
  sv_id: string;
  hd_id: string;
  phuong_thuc?: 'qr' | 'ma_vach' | 'truyen_thong' | 'khuon_mat' | 'thu_cong_fallback';
  dia_chi_ip?: string | null;
  vi_tri_gps?: string | null;
  gps_latitude?: number | null;
  gps_longitude?: number | null;
  gps_accuracy_m?: number | null;
  khoang_cach_m?: number | null;
  ket_qua_geofence?: 'trong_vung' | 'ngoai_vung' | 'khong_co_gps' | 'khong_yeu_cau' | null;
  fallback_request_id?: string | null;
}

export interface ActivityFallbackRequestCreateData {
  sv_id: string;
  hd_id: string;
  ly_do: string;
  minh_chung?: string[];
  gps_latitude?: number | null;
  gps_longitude?: number | null;
  gps_accuracy_m?: number | null;
  dia_chi_ip?: string | null;
  user_agent?: string | null;
}

/**
 * Options for findMany queries
 */
export interface FindManyOptions {
  skip?: number;
  take?: number;
  page?: number;
  limit?: number | string | null;
  sort?: string;
  order?: 'asc' | 'desc';
  orderBy?: Prisma.HoatDongOrderByWithRelationInput | Prisma.HoatDongOrderByWithRelationInput[];
  include?: Prisma.HoatDongInclude;
}

/**
 * Paginated result for findMany
 */
export interface FindManyResult {
  items: HoatDong[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Activity repository interface
 */
abstract class IActivityRepository {
  abstract findMany(
    where?: Prisma.HoatDongWhereInput,
    options?: FindManyOptions
  ): Promise<HoatDong[] | FindManyResult>;

  abstract findById(
    id: string,
    where?: Prisma.HoatDongWhereInput,
    include?: Prisma.HoatDongInclude | null,
    semesterInfo?: { hoc_ky: string; nam_hoc: string }
  ): Promise<HoatDong | null>;

  abstract create(data: Prisma.HoatDongCreateInput): Promise<HoatDong>;

  abstract update(id: string, data: Prisma.HoatDongUpdateInput): Promise<HoatDong>;

  abstract delete(id: string): Promise<HoatDong>;

  abstract count(where?: Prisma.HoatDongWhereInput): Promise<number>;

  abstract findStudentByUserId(userId: string): Promise<ActivityStudentIdentity | null>;

  abstract findUserRegistration(activityId: string, studentId: string): Promise<DangKyHoatDong | null>;

  abstract findFirstClassByTeacherId(teacherId: string): Promise<ActivityTeacherClassIdentity | null>;

  abstract countRegistrationsByActivity(activityId: string): Promise<number>;

  abstract findAttendanceByStudentAndActivity(studentId: string, activityId: string): Promise<DiemDanh | null>;

  abstract createAttendance(data: ActivityAttendanceCreateData): Promise<DiemDanh>;

  abstract markRegistrationAsAttended(studentId: string, activityId: string): Promise<void>;

  abstract createFallbackRequest(data: ActivityFallbackRequestCreateData): Promise<unknown>;

  abstract findFallbackRequestByStudentAndActivity(studentId: string, activityId: string): Promise<unknown | null>;

  abstract listFallbackRequests(activityId?: string, studentId?: string): Promise<unknown[]>;

  abstract findFallbackRequestById(requestId: string): Promise<unknown | null>;

  abstract approveFallbackRequest(requestId: string, approverId: string, note?: string | null): Promise<unknown>;

  abstract rejectFallbackRequest(requestId: string, approverId: string, note: string): Promise<unknown>;

  abstract cancelFallbackRequest(requestId: string, studentId: string): Promise<unknown>;
}

export default IActivityRepository;
module.exports = IActivityRepository;
