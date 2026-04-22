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
}

export default IActivityRepository;
module.exports = IActivityRepository;
