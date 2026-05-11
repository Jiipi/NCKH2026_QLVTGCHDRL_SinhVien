/**
 * Dashboard Repository
 * Data access layer for dashboard operations
 * Follows Repository Pattern
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { Prisma, HocKy, TrangThaiHoatDong } from '@prisma/client';
import type {
  StudentInfo,
  ClassStudentInfo,
  ActivityTypeSummary,
  StudentRegistration,
  UpcomingActivity,
  DashboardActivityFilter,
  SemesterFilter
} from '../../dashboard.types';
import type {
  IDashboardRepository,
  AdminOverviewStats,
  ActivityStatsByStatus,
  ClassRegistration,
  AdminChartStats
} from '../../business/interfaces/IDashboardRepository';

class DashboardRepository implements IDashboardRepository {
  async getStudentInfo(userId: string): Promise<StudentInfo | null> {
    return prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      include: {
        nguoi_dung: {
          select: {
            ho_ten: true,
            email: true
          }
        },
        lop: {
          select: {
            id: true,
            ten_lop: true,
            khoa: true,
            nien_khoa: true,
            chu_nhiem: true
          }
        }
      }
    }) as Promise<StudentInfo | null>;
  }

  async getClassStudents(lopId: string): Promise<ClassStudentInfo[]> {
    return prisma.sinhVien.findMany({
      where: { lop_id: lopId },
      select: {
        id: true,
        nguoi_dung_id: true,
        mssv: true,
        lop_id: true
      }
    }) as Promise<ClassStudentInfo[]>;
  }

  async getActivityTypes(): Promise<ActivityTypeSummary[]> {
    return prisma.loaiHoatDong.findMany({
      select: {
        id: true,
        ten_loai_hd: true,
        diem_toi_da: true
      }
    }) as unknown as Promise<ActivityTypeSummary[]>;
  }

  async getStudentRegistrations(svId: string, activityFilter: DashboardActivityFilter = {}): Promise<StudentRegistration[]> {
    // Build where clause with semester filter applied to hoat_dong relation
    const whereClause: Prisma.DangKyHoatDongWhereInput = {
      sv_id: svId
    };

    // If semester filter exists, apply it to hoat_dong relation
    // Only extract valid Prisma fields (hoc_ky, nam_hoc, trang_thai)
    if (activityFilter.hoc_ky || activityFilter.nam_hoc) {
      const hoatDongFilter: Prisma.HoatDongWhereInput = {};
      if (activityFilter.hoc_ky) hoatDongFilter.hoc_ky = activityFilter.hoc_ky;
      if (activityFilter.nam_hoc) hoatDongFilter.nam_hoc = activityFilter.nam_hoc;
      if (activityFilter.trang_thai) hoatDongFilter.trang_thai = activityFilter.trang_thai as TrangThaiHoatDong;
      whereClause.hoat_dong = hoatDongFilter;
    }

    return prisma.dangKyHoatDong.findMany({
      where: whereClause,
      include: {
        hoat_dong: {
          include: {
            loai_hd: {
              select: {
                id: true,
                ten_loai_hd: true,
                diem_mac_dinh: true,
                diem_toi_da: true,
                mau_sac: true
              }
            }
          }
        }
      },
      orderBy: {
        ngay_dang_ky: 'desc'
      }
    }) as unknown as Promise<StudentRegistration[]>;
  }

  async getUpcomingActivities(
    svId: string,
    classCreators: string[] = [],
    semesterFilter: SemesterFilter = {}
  ): Promise<UpcomingActivity[]> {
    const now = new Date();

    // Build semester where clause - only extract valid Prisma fields
    const semesterWhere: Prisma.HoatDongWhereInput = {};
    if (semesterFilter.hoc_ky) semesterWhere.hoc_ky = semesterFilter.hoc_ky;
    if (semesterFilter.nam_hoc) semesterWhere.nam_hoc = semesterFilter.nam_hoc;

    // Get upcoming activities (not started yet) from class
    const upcomingFromClass = await prisma.hoatDong.findMany({
      where: {
        trang_thai: 'da_duyet',
        ngay_bd: {
          gte: now
        },
        nguoi_tao_id: classCreators.length > 0 ? { in: classCreators } : undefined,
        ...semesterWhere
      },
      include: {
        loai_hd: true,
        dang_ky_hd: {
          where: {
            sv_id: svId
          },
          select: {
            id: true,
            trang_thai_dk: true
          }
        }
      },
      orderBy: {
        ngay_bd: 'asc'
      },
      take: 5
    });

    // Get recent registered activities (from "My Activities")
    const recentRegistered = await prisma.hoatDong.findMany({
      where: {
        trang_thai: 'da_duyet',
        dang_ky_hd: {
          some: {
            sv_id: svId,
            trang_thai_dk: {
              in: ['cho_duyet', 'da_duyet', 'da_tham_gia']
            }
          }
        },
        ...semesterWhere
      },
      include: {
        loai_hd: true,
        dang_ky_hd: {
          where: {
            sv_id: svId
          },
          select: {
            id: true,
            trang_thai_dk: true,
            ngay_dang_ky: true
          }
        }
      },
      orderBy: {
        ngay_bd: 'desc'
      },
      take: 5
    });

    // Combine and deduplicate by activity ID
    const combinedMap = new Map<string, any>();

    upcomingFromClass.forEach(activity => {
      combinedMap.set(activity.id, activity);
    });

    recentRegistered.forEach(activity => {
      if (!combinedMap.has(activity.id)) {
        combinedMap.set(activity.id, activity);
      }
    });

    // Convert to array and sort by date
    const combined = Array.from(combinedMap.values());
    combined.sort((a, b) => {
      const dateA = new Date(a.ngay_bd).getTime();
      const dateB = new Date(b.ngay_bd).getTime();
      return dateA - dateB;
    });

    return combined.slice(0, 10) as unknown as Promise<UpcomingActivity[]>;
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    return prisma.thongBao.count({
      where: {
        nguoi_nhan_id: userId,
        da_doc: false
      }
    });
  }

  async getActivityStatsByTimeRange(fromDate: Date): Promise<ActivityStatsByStatus[]> {
    return prisma.hoatDong.groupBy({
      by: ['trang_thai'],
      where: {
        ngay_tao: {
          gte: fromDate
        }
      },
      _count: {
        id: true
      }
    }) as unknown as Promise<ActivityStatsByStatus[]>;
  }

  async getTotalActivitiesCount(fromDate: Date): Promise<number> {
    return prisma.hoatDong.count({
      where: {
        ngay_tao: {
          gte: fromDate
        }
      }
    });
  }

  async getTotalRegistrationsCount(fromDate: Date): Promise<number> {
    return prisma.dangKyHoatDong.count({
      where: {
        ngay_dang_ky: {
          gte: fromDate
        }
      }
    });
  }

  async getAdminOverviewStats(semester?: { hoc_ky: string; nam_hoc: string }): Promise<AdminOverviewStats> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Build semester filter if provided
    const semesterFilter: Prisma.HoatDongWhereInput = semester ? {
      hoc_ky: semester.hoc_ky as HocKy,
      nam_hoc: semester.nam_hoc
    } : {};

    const [
      totalUsers,
      totalActivities,
      totalRegistrations,
      activeUsers,
      pendingApprovals,
      todayApprovals,
      newUsersThisMonth
    ] = await Promise.all([
      prisma.nguoiDung.count(),
      prisma.hoatDong.count({
        where: semesterFilter
      }),
      prisma.dangKyHoatDong.count({
        where: semester ? {
          hoat_dong: semesterFilter
        } : undefined
      }),
      prisma.nguoiDung.count({ where: { trang_thai: 'hoat_dong' } }),
      prisma.dangKyHoatDong.count({
        where: {
          trang_thai_dk: 'cho_duyet',
          ...(semester && { hoat_dong: semesterFilter })
        }
      }),
      prisma.dangKyHoatDong.count({
        where: {
          trang_thai_dk: 'da_duyet',
          ngay_duyet: {
            gte: startOfToday,
            lte: endOfToday
          },
          ...(semester && { hoat_dong: semesterFilter })
        }
      }),
      prisma.nguoiDung.count({
        where: {
          ngay_tao: {
            gte: startOfMonth
          }
        }
      })
    ]);

    return {
      totalUsers,
      totalActivities,
      totalRegistrations,
      activeUsers,
      pendingApprovals,
      todayApprovals,
      newUsersThisMonth
    };
  }

  async getClassRegistrations(
    lopId: string,
    activityFilter: DashboardActivityFilter = {}
  ): Promise<ClassRegistration[]> {
    // Build where clause with semester filter applied to hoat_dong relation
    const whereClause: Prisma.DangKyHoatDongWhereInput = {
      sinh_vien: {
        lop_id: lopId
      },
      // Only count attended registrations (QR scanned) for points - đồng bộ với trang Score
      trang_thai_dk: 'da_tham_gia'
    };

    // If semester filter exists, apply it to hoat_dong relation
    // Only extract valid Prisma fields (hoc_ky, nam_hoc, trang_thai)
    if (activityFilter.hoc_ky || activityFilter.nam_hoc) {
      const hoatDongFilter: Prisma.HoatDongWhereInput = {};
      if (activityFilter.hoc_ky) hoatDongFilter.hoc_ky = activityFilter.hoc_ky;
      if (activityFilter.nam_hoc) hoatDongFilter.nam_hoc = activityFilter.nam_hoc;
      if (activityFilter.trang_thai) hoatDongFilter.trang_thai = activityFilter.trang_thai as TrangThaiHoatDong;
      whereClause.hoat_dong = hoatDongFilter;
    }

    return prisma.dangKyHoatDong.findMany({
      where: whereClause,
      select: {
        sv_id: true,
        hoat_dong: {
          include: {
            loai_hd: {
              select: {
                diem_mac_dinh: true,
                diem_toi_da: true
              }
            }
          }
        }
      }
    }) as unknown as Promise<ClassRegistration[]>;
  }

  async getAdminChartStats(semester?: { hoc_ky: string; nam_hoc: string }): Promise<AdminChartStats> {
    const semesterFilter: Prisma.HoatDongWhereInput = semester ? {
      hoc_ky: semester.hoc_ky as HocKy,
      nam_hoc: semester.nam_hoc
    } : {};

    // 1. Activities by type (loai_hd)
    const activitiesWithType = await prisma.hoatDong.findMany({
      where: semesterFilter,
      select: {
        loai_hd: {
          select: { ten_loai_hd: true }
        }
      }
    });

    const typeCountMap: Record<string, number> = {};
    activitiesWithType.forEach(a => {
      const typeName = a.loai_hd?.ten_loai_hd || 'Khác';
      typeCountMap[typeName] = (typeCountMap[typeName] || 0) + 1;
    });
    const activitiesByType = Object.entries(typeCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 2. Registrations by status
    const STATUS_LABELS: Record<string, { name: string; color: string }> = {
      cho_duyet: { name: 'Chờ duyệt', color: '#F59E0B' },
      da_duyet: { name: 'Đã duyệt', color: '#10B981' },
      tu_choi: { name: 'Từ chối', color: '#EF4444' },
      da_tham_gia: { name: 'Đã tham gia', color: '#6366F1' },
      da_huy: { name: 'Đã hủy', color: '#94A3B8' }
    };

    const regGrouped = await prisma.dangKyHoatDong.groupBy({
      by: ['trang_thai_dk'],
      where: semester ? { hoat_dong: semesterFilter } : undefined,
      _count: { id: true }
    });

    const registrationsByStatus = regGrouped.map(g => {
      const meta = STATUS_LABELS[g.trang_thai_dk] || { name: g.trang_thai_dk, color: '#94A3B8' };
      return { name: meta.name, count: g._count.id, color: meta.color };
    }).sort((a, b) => b.count - a.count);

    // 3. Participation rate
    const totalRegs = registrationsByStatus.reduce((s, r) => s + r.count, 0);
    const attendedCount = regGrouped.find(g => g.trang_thai_dk === 'da_tham_gia')?._count.id || 0;
    const participationRate = totalRegs > 0 ? Math.round((attendedCount / totalRegs) * 100) : 0;

    // 4. Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [recentActivities, recentRegistrations] = await Promise.all([
      prisma.hoatDong.findMany({
        where: {
          ngay_tao: { gte: sixMonthsAgo },
          ...semesterFilter
        },
        select: { ngay_tao: true }
      }),
      prisma.dangKyHoatDong.findMany({
        where: {
          ngay_dang_ky: { gte: sixMonthsAgo },
          ...(semester ? { hoat_dong: semesterFilter } : {})
        },
        select: { ngay_dang_ky: true }
      })
    ]);

    const monthLabels = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    const trendMap: Record<string, { activities: number; registrations: number }> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trendMap[key] = { activities: 0, registrations: 0 };
    }

    recentActivities.forEach(a => {
      const d = new Date(a.ngay_tao);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (trendMap[key]) trendMap[key].activities++;
    });

    recentRegistrations.forEach(r => {
      const d = new Date(r.ngay_dang_ky);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (trendMap[key]) trendMap[key].registrations++;
    });

    const monthlyTrend = Object.entries(trendMap).map(([key, val]) => {
      const monthIndex = parseInt(key.split('-')[1], 10) - 1;
      return {
        label: monthLabels[monthIndex],
        activities: val.activities,
        registrations: val.registrations
      };
    });

    return {
      activitiesByType,
      registrationsByStatus,
      participationRate,
      monthlyTrend
    };
  }
}

export default new DashboardRepository();
