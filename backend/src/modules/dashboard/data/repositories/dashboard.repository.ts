/**
 * Dashboard Repository
 * Data access layer for dashboard operations
 * Follows Repository Pattern
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
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
  ClassRegistration
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
    return prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: svId,
        hoat_dong: activityFilter as any
      },
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
    return prisma.hoatDong.findMany({
      where: {
        trang_thai: 'da_duyet',
        ngay_bd: {
          gte: new Date()
        },
        nguoi_tao_id: classCreators.length > 0 ? { in: classCreators } : undefined,
        ...semesterFilter
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
      take: 10
    }) as unknown as Promise<UpcomingActivity[]>;
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

  async getAdminOverviewStats(): Promise<AdminOverviewStats> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

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
      prisma.hoatDong.count(),
      prisma.dangKyHoatDong.count(),
      prisma.nguoiDung.count({ where: { trang_thai: 'hoat_dong' } }),
      prisma.dangKyHoatDong.count({
        where: { trang_thai_dk: 'cho_duyet' }
      }),
      prisma.dangKyHoatDong.count({
        where: {
          trang_thai_dk: 'da_duyet',
          ngay_duyet: {
            gte: startOfToday,
            lte: endOfToday
          }
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
    return prisma.dangKyHoatDong.findMany({
      where: {
        sinh_vien: {
          lop_id: lopId
        },
        hoat_dong: activityFilter as any,
        trang_thai_dk: 'da_tham_gia' // Only fetch attended registrations for ranking
      },
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
}

export default new DashboardRepository();
