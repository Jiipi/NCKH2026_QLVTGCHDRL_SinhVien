/**
 * Teacher Registration Repository
 * Handles registration-related operations for teachers
 * Follows Single Responsibility Principle (SRP)
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import { parseSemesterString } from '../../../../core/utils/semester';
import { findTeacherClassesRaw } from './helpers/teacherClassHelper';
import type { HocKy, Prisma, TrangThaiDangKy } from '@prisma/client';

export interface ClassRegistrationFilters {
  status?: string;
  semester?: string;
}

export interface RegistrationForCharts {
  id: string;
  sv_id: string;
  sinh_vien: {
    nguoi_dung?: {
      ho_ten: string | null;
    };
  };
  hoat_dong: {
    id: string;
    ngay_bd: Date;
    diem_rl: number | null;
    loai_hd?: {
      ten_loai_hd: string;
    };
  };
  ngay_dang_ky: Date;
  trang_thai_dk: string;
}

export interface RegistrationForReports {
  id: string;
  sv_id: string;
  sinh_vien: {
    mssv?: string;
    nguoi_dung?: {
      ho_ten: string | null;
    };
  };
  hoat_dong: {
    id: string;
    diem_rl: number | null;
    loai_hd?: {
      ten_loai_hd: string;
    };
  };
  ngay_dang_ky: Date;
}

/**
 * Teacher Registration Repository class
 */
class TeacherRegistrationRepository {
  /**
   * Get all registrations from students in teacher's classes
   * @param classIds - Array of class IDs
   * @param filters - Optional filters { status, semester }
   * @returns Array of registrations
   */
  async getClassRegistrations(classIds: string[], filters: ClassRegistrationFilters = {}) {
    try {
      const { status, semester } = filters;
      
      console.log('[getClassRegistrations] classIds:', classIds);
      console.log('[getClassRegistrations] filters:', filters);
      
      // Build where clause - filter by students in teacher's classes
      const where: Prisma.DangKyHoatDongWhereInput = {
        sinh_vien: {
          lop_id: { in: classIds }
        }
      };
      
      // Only filter by status if it's not 'all'
      if (status && status !== 'all') {
        where.trang_thai_dk = status as TrangThaiDangKy;
      }
      
      // Build activity filter for semester using simple matcher
      const activityFilter: { hoc_ky?: HocKy; nam_hoc?: string } = {};
      if (semester) {
        const parsed = parseSemesterString(semester);
        if (parsed && parsed.year) {
          activityFilter.hoc_ky = parsed.semester as HocKy;
          activityFilter.nam_hoc = parsed.year;
        }
      }
      
      // Add activity filter to where clause if present
      if (Object.keys(activityFilter).length > 0) {
        where.hoat_dong = { is: activityFilter };
      }
      
      console.log('[getClassRegistrations] where clause:', JSON.stringify(where, null, 2));
      
      // Get registrations with full relations
      const registrations = await prisma.dangKyHoatDong.findMany({
        where,
        include: {
          sinh_vien: {
            include: {
              nguoi_dung: { 
                select: { 
                  ho_ten: true, 
                  email: true, 
                  anh_dai_dien: true 
                } 
              },
              lop: { 
                select: { 
                  ten_lop: true 
                } 
              }
            }
          },
          hoat_dong: { 
            select: { 
              id: true,
              ten_hd: true, 
              ngay_bd: true, 
              diem_rl: true, 
              dia_diem: true, 
              hinh_anh: true,
              loai_hd: { select: { id: true, ten_loai_hd: true } }
            } 
          },
          nguoi_duyet: {
            select: {
              id: true,
              ho_ten: true,
              vai_tro: { select: { ten_vt: true } }
            }
          }
        },
        orderBy: { ngay_dang_ky: 'desc' },
        take: 500
      });
      
      console.log('[getClassRegistrations] Found registrations:', registrations.length);
      
      // Deduplicate by ID (in case of data issues)
      const seen = new Set<string>();
      const deduplicatedRegistrations = registrations.filter(reg => {
        if (seen.has(reg.id)) {
          console.warn('[getClassRegistrations] Duplicate registration ID found:', reg.id);
          return false;
        }
        seen.add(reg.id);
        return true;
      });
      
      if (deduplicatedRegistrations.length < registrations.length) {
        console.warn('[getClassRegistrations] Removed', registrations.length - deduplicatedRegistrations.length, 'duplicate(s)');
      }
      
      return deduplicatedRegistrations;
    } catch (error) {
      console.error('[getClassRegistrations] Error:', error);
      throw error;
    }
  }

  /**
   * Get detailed registrations for all teacher's classes (for reports/charts)
   * Returns ALL registrations (not filtered by status) for activity counting
   * @param teacherId - Teacher's user ID
   * @param semesterId - Semester filter (e.g., '1-2025')
   * @returns Array of registrations with activity details
   */
  async getTeacherClassRegistrationsForChartsAll(teacherId: string, semesterId: string | null = null): Promise<RegistrationForCharts[]> {
    const classes = await findTeacherClassesRaw(teacherId);
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) {
      return [];
    }

    const activityWhere: Prisma.HoatDongWhereInput = {
      trang_thai: { in: ['da_duyet', 'ket_thuc'] }
    };
    
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
        activityWhere.nam_hoc = yearRaw;
      }
    }

    const registrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sinh_vien: { lop_id: { in: classIds } },
        hoat_dong: { is: activityWhere }
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: { select: { ten_loai_hd: true } }
          }
        },
        sinh_vien: {
          include: {
            nguoi_dung: { select: { ho_ten: true } }
          }
        }
      },
      orderBy: { ngay_dang_ky: 'desc' }
    });

    return registrations.map(r => ({
      id: r.id,
      sv_id: r.sv_id,
      sinh_vien: r.sinh_vien as unknown as RegistrationForCharts['sinh_vien'],
      hoat_dong: {
        id: r.hoat_dong.id,
        ngay_bd: r.hoat_dong.ngay_bd,
        diem_rl: Number(r.hoat_dong.diem_rl) || 0,
        loai_hd: r.hoat_dong.loai_hd
      },
      ngay_dang_ky: r.ngay_dang_ky,
      trang_thai_dk: r.trang_thai_dk
    }));
  }

  /**
   * Get detailed registrations for all teacher's classes (for reports/charts)
   * Returns only PARTICIPATED registrations (da_tham_gia) for points calculation
   * @param teacherId - Teacher's user ID
   * @param semesterId - Semester filter (e.g., '1-2025')
   * @returns Array of registrations with activity details
   */
  async getTeacherClassRegistrationsForReports(teacherId: string, semesterId: string | null = null): Promise<RegistrationForReports[]> {
    const classes = await findTeacherClassesRaw(teacherId);
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) {
      return [];
    }

    const activityWhere: Prisma.HoatDongWhereInput = {};
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
        activityWhere.nam_hoc = yearRaw;
      }
    }

    const registrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sinh_vien: { lop_id: { in: classIds } },
        trang_thai_dk: 'da_tham_gia',
        hoat_dong: activityWhere
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: { select: { ten_loai_hd: true } }
          }
        },
        sinh_vien: {
          include: {
            nguoi_dung: { select: { ho_ten: true } }
          }
        }
      },
      orderBy: { ngay_dang_ky: 'desc' }
    });

    return registrations.map(r => ({
      id: r.id,
      sv_id: r.sv_id,
      sinh_vien: r.sinh_vien as unknown as RegistrationForReports['sinh_vien'],
      hoat_dong: {
        id: r.hoat_dong.id,
        diem_rl: Number(r.hoat_dong.diem_rl) || 0,
        loai_hd: r.hoat_dong.loai_hd
      },
      ngay_dang_ky: r.ngay_dang_ky
    }));
  }
}

export default TeacherRegistrationRepository;
