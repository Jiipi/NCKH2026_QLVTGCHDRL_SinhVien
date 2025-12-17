/**
 * Class Activity Counter Utility
 * Hàm chung để đếm tổng hoạt động của một lớp
 *
 * Logic chuẩn (theo schema mới):
 * - Đếm tất cả hoạt động trong bảng HoatDong
 * - Filter: trang_thai IN ('da_duyet', 'ket_thuc')
 * - Filter: lop_id = id lớp
 * - Optional: filter theo hoc_ky + nam_hoc
 *
 * @module core/utils/classActivityCounter
 */

import { prisma } from '../../data/infrastructure/prisma/client';
import { TrangThaiHoatDong, HocKy } from '@prisma/client';

/**
 * Semester filter interface
 */
export interface SemesterFilter {
  hoc_ky?: string;
  nam_hoc?: string;
}

/**
 * Query options interface
 */
export interface ActivityQueryOptions {
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * Activity with relations type
 */
export interface ClassActivity {
  id: string;
  ten_hd: string;
  trang_thai: string;
  hoc_ky?: string | null;
  nam_hoc?: string | null;
  ngay_cap_nhat?: Date | null;
  loai_hd?: {
    id: string;
    ten_loai_hd: string;
    mau_sac?: string | null;
  } | null;
  nguoi_tao?: {
    id: string;
    ho_ten: string;
  } | null;
  [key: string]: unknown;
}

/**
 * Đếm tổng hoạt động của lớp theo chuẩn
 * @param classId - ID lớp
 * @param semesterFilter - Optional { hoc_ky, nam_hoc }
 * @returns Số lượng hoạt động
 */
export async function countClassActivities(
  classId: string,
  semesterFilter: SemesterFilter = {}
): Promise<number> {
  const where: {
    lop_id: string;
    trang_thai: { in: TrangThaiHoatDong[] };
    hoc_ky?: HocKy;
    nam_hoc?: string;
  } = {
    lop_id: classId,
    trang_thai: { in: [TrangThaiHoatDong.da_duyet, TrangThaiHoatDong.ket_thuc] }
  };

  // Thêm filter học kỳ nếu có
  if (semesterFilter.hoc_ky) {
    where.hoc_ky = semesterFilter.hoc_ky as HocKy;
  }
  if (semesterFilter.nam_hoc) {
    // Data đã được chuẩn hóa sang năm đơn, dùng exact match hoặc contains để backward compatible
    // Nếu user gửi "2025-2026", extract năm đầu
    const year = String(semesterFilter.nam_hoc).match(/^(\d{4})/)?.[1] || semesterFilter.nam_hoc;
    where.nam_hoc = year;
  }

  return prisma.hoatDong.count({ where });
}

/**
 * Lấy danh sách hoạt động của lớp theo chuẩn
 * @param classId - ID lớp
 * @param semesterFilter - Optional { hoc_ky, nam_hoc }
 * @param options - Optional { limit, orderBy }
 * @returns Danh sách hoạt động
 */
export async function getClassActivities(
  classId: string,
  semesterFilter: SemesterFilter = {},
  options: ActivityQueryOptions = {}
): Promise<ClassActivity[]> {
  const where: {
    lop_id: string;
    trang_thai: { in: TrangThaiHoatDong[] };
    hoc_ky?: HocKy;
    nam_hoc?: string;
  } = {
    lop_id: classId,
    trang_thai: { in: [TrangThaiHoatDong.da_duyet, TrangThaiHoatDong.ket_thuc] }
  };

  // Thêm filter học kỳ nếu có
  if (semesterFilter.hoc_ky) {
    where.hoc_ky = semesterFilter.hoc_ky as HocKy;
  }
  if (semesterFilter.nam_hoc) {
    // Data đã được chuẩn hóa sang năm đơn
    const year = String(semesterFilter.nam_hoc).match(/^(\d{4})/)?.[1] || semesterFilter.nam_hoc;
    where.nam_hoc = year;
  }

  const queryOptions: {
    where: typeof where;
    orderBy: Record<string, 'asc' | 'desc'>;
    include: {
      loai_hd: { select: { id: boolean; ten_loai_hd: boolean; mau_sac: boolean } };
      nguoi_tao: { select: { id: boolean; ho_ten: boolean } };
    };
    take?: number;
  } = {
    where,
    orderBy: options.orderBy || { ngay_cap_nhat: 'desc' },
    include: {
      loai_hd: {
        select: { id: true, ten_loai_hd: true, mau_sac: true }
      },
      nguoi_tao: {
        select: { id: true, ho_ten: true }
      }
    }
  };

  if (options.limit) {
    queryOptions.take = options.limit;
  }

  return prisma.hoatDong.findMany(queryOptions) as Promise<ClassActivity[]>;
}

// CommonJS compatibility
module.exports = {
  countClassActivities,
  getClassActivities
};
