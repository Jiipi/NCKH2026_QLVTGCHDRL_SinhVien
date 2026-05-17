/**
 * Points Repository
 * Data access layer for points operations
 */
import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { Prisma, HocKy } from '@prisma/client';
import { parseSemesterString } from '../../../../core/utils/semester';
import type {
  IPointsRepository,
  StudentWithDetails,
  PointsFilters,
  PaginationParams,
  RegistrationWithActivity,
  AttendanceWithDetails,
  StatusCount,
} from '../../business/interfaces/IPointsRepository';

class PointsRepository implements IPointsRepository {
  private mergeAttendanceIntoRegistrations(
    registrations: RegistrationWithActivity[],
    attendances: Array<{
      id: string;
      sv_id: string;
      hd_id: string;
      tg_diem_danh: Date;
      hoat_dong: RegistrationWithActivity['hoat_dong'];
    }>
  ): RegistrationWithActivity[] {
    const byActivity = new Map<string, RegistrationWithActivity>();

    registrations.forEach((registration) => {
      byActivity.set(registration.hd_id || registration.hoat_dong?.id || registration.id, registration);
    });

    attendances.forEach((attendance) => {
      if (byActivity.has(attendance.hd_id)) return;

      byActivity.set(attendance.hd_id, {
        id: `attendance:${attendance.id}`,
        sv_id: attendance.sv_id,
        hd_id: attendance.hd_id,
        trang_thai_dk: 'da_tham_gia',
        ngay_dang_ky: attendance.tg_diem_danh,
        ngay_duyet: attendance.tg_diem_danh,
        hoat_dong: attendance.hoat_dong,
      });
    });

    return Array.from(byActivity.values());
  }

  async findStudentByUserId(userId: string): Promise<StudentWithDetails | null> {
    const result = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      include: {
        nguoi_dung: {
          select: {
            ho_ten: true,
            email: true,
          },
        },
        lop: {
          select: {
            ten_lop: true,
            khoa: true,
            nien_khoa: true,
          },
        },
      },
    });
    return result as unknown as StudentWithDetails | null;
  }

  async findAttendedRegistrations(studentId: string, filters: PointsFilters = {}): Promise<RegistrationWithActivity[]> {
    const { semester } = filters;

    const where: Prisma.DangKyHoatDongWhereInput = {
      sv_id: studentId,
      trang_thai_dk: 'da_tham_gia',
    };

    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        where.hoat_dong = {
          hoc_ky: parsed.semester,
          nam_hoc: parsed.year,
        };
      }
    }

    const [registrations, attendances] = await Promise.all([
      prisma.dangKyHoatDong.findMany({
        where,
        include: {
          hoat_dong: {
            include: {
              loai_hd: true,
            },
          },
        },
      }),
      prisma.diemDanh.findMany({
        where: {
          sv_id: studentId,
          trang_thai_tham_gia: 'co_mat',
          xac_nhan_tham_gia: true,
          ...(where.hoat_dong ? { hoat_dong: where.hoat_dong as Prisma.HoatDongWhereInput } : {}),
        },
        include: {
          hoat_dong: {
            include: {
              loai_hd: true,
            },
          },
        },
      }),
    ]);

    return this.mergeAttendanceIntoRegistrations(
      registrations as unknown as RegistrationWithActivity[],
      attendances as unknown as Array<{
        id: string;
        sv_id: string;
        hd_id: string;
        tg_diem_danh: Date;
        hoat_dong: RegistrationWithActivity['hoat_dong'];
      }>
    );
  }

  async findAllRegistrations(studentId: string): Promise<RegistrationWithActivity[]> {
    const results = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: studentId,
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true,
          },
        },
      },
      orderBy: {
        ngay_dang_ky: 'desc',
      },
      take: 10,
    });

    return results as unknown as RegistrationWithActivity[];
  }

  async getRegistrationStatusCounts(studentId: string): Promise<StatusCount[]> {
    const results = await prisma.dangKyHoatDong.groupBy({
      by: ['trang_thai_dk'],
      where: {
        sv_id: studentId,
      },
      _count: {
        id: true,
      },
    });

    return results as unknown as StatusCount[];
  }

  async findRegistrationsWithPagination(
    studentId: string,
    filters: PointsFilters,
    pagination: PaginationParams
  ): Promise<{ registrations: RegistrationWithActivity[]; total: number }> {
    const { semester } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const whereCondition: Prisma.DangKyHoatDongWhereInput = { sv_id: studentId };

    let where: Prisma.DangKyHoatDongWhereInput = whereCondition;
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        where = {
          ...whereCondition,
          hoat_dong: {
            hoc_ky: parsed.semester,
            nam_hoc: parsed.year,
          },
        };
      }
    }

    const [registrations, total] = await Promise.all([
      prisma.dangKyHoatDong.findMany({
        where,
        include: {
          hoat_dong: { include: { loai_hd: true } },
        },
        orderBy: {
          ngay_dang_ky: 'desc',
        },
        skip: offset,
        take: parseInt(String(limit)),
      }),
      prisma.dangKyHoatDong.count({ where }),
    ]);

    return { registrations: registrations as unknown as RegistrationWithActivity[], total };
  }

  async findAttendanceRecords(
    studentId: string,
    pagination: PaginationParams
  ): Promise<{ attendances: AttendanceWithDetails[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;
    const offset = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const [attendances, total] = await Promise.all([
      prisma.diemDanh.findMany({
        where: {
          sv_id: studentId,
        },
        include: {
          hoat_dong: {
            include: {
              loai_hd: true,
            },
          },
          nguoi_diem_danh: {
            select: {
              ho_ten: true,
              email: true,
            },
          },
        },
        orderBy: {
          tg_diem_danh: 'desc',
        },
        skip: offset,
        take: parseInt(String(limit)),
      }),
      prisma.diemDanh.count({
        where: {
          sv_id: studentId,
        },
      }),
    ]);

    return { attendances: attendances as unknown as AttendanceWithDetails[], total };
  }

  async getUniqueSemesters(studentId: string): Promise<(string | null)[]> {
    const hocKyData = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: studentId,
        trang_thai_dk: 'da_tham_gia',
      },
      select: {
        hoat_dong: {
          select: {
            hoc_ky: true,
          },
        },
      },
    });

    return hocKyData
      .map((item) => item.hoat_dong?.hoc_ky ?? null)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  async getUniqueAcademicYears(studentId: string): Promise<(string | null)[]> {
    const namHocData = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: studentId,
        trang_thai_dk: 'da_tham_gia',
      },
      select: {
        hoat_dong: {
          select: {
            nam_hoc: true,
          },
        },
      },
    });

    return namHocData
      .map((item) => item.hoat_dong?.nam_hoc ?? null)
      .filter((value, index, self): value is string => value !== null && self.indexOf(value) === index)
      .sort((a, b) => b.localeCompare(a));
  }

  async findCompletedRegistrationsForSemester(
    studentId: string,
    hocKy: string,
    namHoc: string | null = null
  ): Promise<RegistrationWithActivity[]> {
    const whereCondition: Prisma.DangKyHoatDongWhereInput = {
      sv_id: studentId,
      trang_thai_dk: 'da_tham_gia',
      hoat_dong: {
        trang_thai: 'ket_thuc',
        hoc_ky: hocKy as HocKy,
        ...(namHoc ? { nam_hoc: namHoc } : {}),
      },
    };

    const results = await prisma.dangKyHoatDong.findMany({
      where: whereCondition,
      include: {
        hoat_dong: {
          include: {
            loai_hd: true,
          },
        },
      },
    });

    return results as unknown as RegistrationWithActivity[];
  }
}

const pointsRepository = new PointsRepository();

export { PointsRepository, pointsRepository };
export default pointsRepository;
module.exports = pointsRepository;
