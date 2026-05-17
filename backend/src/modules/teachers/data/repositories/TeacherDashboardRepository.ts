/**
 * Teacher Dashboard Repository
 * Handles dashboard statistics and notifications
 * Follows Single Responsibility Principle (SRP)
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import { parseSemesterString } from '../../../../core/utils/semester';
import { findTeacherClassesRaw } from './helpers/teacherClassHelper';
import { countClassActivities } from '../../../../core/utils/classActivityCounter';
import type { HocKy, TrangThaiHoatDong as PrismaTrangThaiHoatDong, TrangThaiDangKy, Prisma } from '@prisma/client';

export interface DashboardStats {
  totalActivities: number;
  pendingApprovals: number;
  totalStudents: number;
  avgClassScore: number;
  participationRate: number;
  approvedThisWeek: number;
}

export interface ClassStatsResult {
  totalStudents: number;
  totalActivities: number;
  approvedActivities: number;
  totalRegistrations: number;
  approvedRegistrations: number;
}

interface SemesterFilter {
  hoc_ky?: HocKy;
  nam_hoc?: string;
}

/**
 * Teacher Dashboard Repository class
 */
class TeacherDashboardRepository {
  /**
   * Get teacher dashboard stats with semester support
   * @param teacherId - Teacher's user ID
   * @param semester - Optional semester string (e.g., 'hoc_ky_1-2025')
   * @param classId - Optional class ID filter
   * @returns Dashboard statistics
   */
  async getDashboardStats(teacherId: string, semester: string | null = null, classId: string | null = null): Promise<DashboardStats> {
    let classes = await findTeacherClassesRaw(teacherId);
    if (classId) {
      classes = classes.filter(c => String(c.id) === String(classId));
    }
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) {
      return {
        totalActivities: 0,
        pendingApprovals: 0,
        totalStudents: 0,
        avgClassScore: 0,
        participationRate: 0,
        approvedThisWeek: 0
      };
    }

    // Get all students in teacher's classes
    const students = await prisma.sinhVien.findMany({
      where: { lop_id: { in: classIds } },
      select: { id: true, nguoi_dung_id: true }
    });

    const studentIds = students.map(s => s.id);
    const studentUserIds = students.map(s => s.nguoi_dung_id).filter((id): id is string => Boolean(id));

    // Parse semester filter
    let semesterFilter: SemesterFilter = {};
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        semesterFilter = { hoc_ky: parsed.semester as HocKy, nam_hoc: parsed.year };
      }
    }

    // Build activity filter for pending/approved counts
    // Support activities created by class members even if lop_id is null
    const activityWhere = {
      OR: [
        { lop_id: { in: classIds } },
        { nguoi_tao_id: { in: studentUserIds.concat([teacherId]) } }
      ],
      trang_thai: { in: ['da_duyet', 'ket_thuc'] as PrismaTrangThaiHoatDong[] },
      ...(semesterFilter.hoc_ky && { hoc_ky: semesterFilter.hoc_ky }),
      ...(semesterFilter.nam_hoc && { nam_hoc: { contains: semesterFilter.nam_hoc } })
    };

    // Count total activities using countClassActivities utility
    const totalActivitiesPromises = classIds.map(cId => countClassActivities(cId, semesterFilter, {
      classCreatorUserIds: studentUserIds.concat([teacherId])
    }));

    const [
      classActivityCounts,
      pendingActivitiesCount,
      approvedLastWeek,
      participatedRegistrations
    ] = await Promise.all([
      Promise.all(totalActivitiesPromises),
      prisma.hoatDong.count({
        where: {
          OR: [
            { lop_id: { in: classIds } },
            { nguoi_tao_id: { in: studentUserIds.concat([teacherId]) } }
          ],
          trang_thai: 'cho_duyet',
          ...(semesterFilter.hoc_ky && { hoc_ky: semesterFilter.hoc_ky }),
          ...(semesterFilter.nam_hoc && { nam_hoc: { contains: semesterFilter.nam_hoc } })
        }
      }),
      prisma.hoatDong.count({
        where: {
          ...activityWhere,
          trang_thai: 'da_duyet',
          ngay_cap_nhat: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.dangKyHoatDong.findMany({
        where: {
          sv_id: { in: studentIds },
          trang_thai_dk: 'da_tham_gia' as TrangThaiDangKy,
          hoat_dong: {
            is: activityWhere
          }
        },
        include: {
          hoat_dong: {
            select: { diem_rl: true }
          }
        }
      })
    ]);

    const totalActivities = classActivityCounts.reduce((sum, count) => sum + count, 0);

    // Calculate average score
    const totalScore = participatedRegistrations.reduce((sum, reg) => {
      return sum + (Number(reg.hoat_dong?.diem_rl) || 0);
    }, 0);
    const avgClassScore = studentIds.length > 0
      ? Math.round(totalScore / studentIds.length)
      : 0;

    // Calculate participation rate
    const uniqueParticipants = new Set(participatedRegistrations.map(r => r.sv_id));
    const participationRate = studentIds.length > 0
      ? Math.round((uniqueParticipants.size / studentIds.length) * 100)
      : 0;

    return {
      totalActivities,
      pendingApprovals: pendingActivitiesCount,
      totalStudents: studentIds.length,
      avgClassScore,
      participationRate,
      approvedThisWeek: approvedLastWeek
    };
  }

  /**
   * Get class statistics by class name
   * @param className - Class name (ten_lop)
   * @param semesterId - Optional semester filter
   * @returns Class statistics
   */
  async getClassStats(className: string, semesterId: string | null = null): Promise<ClassStatsResult> {
    const lop = await prisma.lop.findUnique({ where: { ten_lop: className } });
    if (!lop) {
      return {
        totalStudents: 0,
        totalActivities: 0,
        approvedActivities: 0,
        totalRegistrations: 0,
        approvedRegistrations: 0
      };
    }

    // Build activity filter
    const activityWhere: Prisma.HoatDongWhereInput = {
      dang_ky_hd: {
        some: {
          sinh_vien: { lop_id: lop.id }
        }
      },
      trang_thai: { in: ['da_duyet', 'ket_thuc'] as PrismaTrangThaiHoatDong[] },
      hoc_ky: undefined,
      nam_hoc: undefined
    };

    const approvedActivityWhere = { ...activityWhere };

    if (semesterId) {
      const semStr = String(semesterId).trim();
      let hocKy: HocKy | null = null;
      let yearRaw: string | null = null;

      const m = semStr.match(/^(hoc_ky_1|hoc_ky_2|1|2)[-_](\d{4})$/);
      if (m) {
        const hkToken = m[1];
        yearRaw = m[2];
        hocKy = (hkToken === '2' || hkToken === 'hoc_ky_2') ? 'hoc_ky_2' : 'hoc_ky_1';
      } else {
        const y = semStr.match(/(\d{4})/);
        if (y) yearRaw = y[1];
        if (/hoc_ky_2|\b2\b/.test(semStr)) hocKy = 'hoc_ky_2';
        else if (/hoc_ky_1|\b1\b/.test(semStr)) hocKy = 'hoc_ky_1';
      }

      if (hocKy && yearRaw) {
        activityWhere.hoc_ky = hocKy;
        activityWhere.nam_hoc = { contains: yearRaw };
        approvedActivityWhere.hoc_ky = hocKy;
        approvedActivityWhere.nam_hoc = { contains: yearRaw };
      }
    }

    const [totalStudents, totalActivities, approvedActivities] = await Promise.all([
      prisma.sinhVien.count({ where: { lop_id: lop.id } }),
      prisma.hoatDong.count({ where: activityWhere }),
      prisma.hoatDong.count({ where: approvedActivityWhere })
    ]);

    // Registrations by students in class
    type TrangThaiDangKyEnum = 'cho_duyet' | 'da_duyet' | 'da_tham_gia' | 'tu_choi' | 'huy';
    interface RegistrationWhere {
      sinh_vien: { lop_id: string };
      hoat_dong?: Prisma.HoatDongWhereInput;
      trang_thai_dk?: TrangThaiDangKyEnum;
    }

    const registrationWhere: RegistrationWhere = {
      sinh_vien: { lop_id: lop.id }
    };
    if (semesterId && activityWhere.hoc_ky && activityWhere.nam_hoc) {
      registrationWhere.hoat_dong = {
        hoc_ky: activityWhere.hoc_ky,
        nam_hoc: activityWhere.nam_hoc
      };
    }
    const approvedRegistrationWhere: RegistrationWhere = {
      ...registrationWhere,
      trang_thai_dk: 'da_duyet' as TrangThaiDangKyEnum
    };

    const [totalRegistrations, approvedRegistrations] = await Promise.all([
      prisma.dangKyHoatDong.count({ where: registrationWhere as Prisma.DangKyHoatDongWhereInput }),
      prisma.dangKyHoatDong.count({ where: approvedRegistrationWhere as Prisma.DangKyHoatDongWhereInput })
    ]);

    return {
      totalStudents,
      totalActivities,
      approvedActivities,
      totalRegistrations,
      approvedRegistrations
    };
  }

  /**
   * Get recent notifications sent by teacher
   * @param teacherId - Teacher's user ID
   * @param limit - Max number of notifications to return
   * @returns Array of notifications
   */
  async getRecentNotifications(teacherId: string, limit: number = 5) {
    return prisma.thongBao.findMany({
      where: {
        nguoi_gui_id: teacherId
      },
      include: {
        loai_tb: true
      },
      orderBy: { ngay_gui: 'desc' },
      take: limit
    });
  }
}

export default TeacherDashboardRepository;
