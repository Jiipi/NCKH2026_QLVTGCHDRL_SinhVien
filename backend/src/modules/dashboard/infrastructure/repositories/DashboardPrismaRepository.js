const { prisma } = require('../../../../infrastructure/prisma/client');
const IDashboardRepository = require('../../domain/interfaces/IDashboardRepository');

/**
 * DashboardPrismaRepository
 * Prisma implementation of IDashboardRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class DashboardPrismaRepository extends IDashboardRepository {
  async getStudentInfo(userId) {
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
    });
  }

  async getClassStudents(lopId) {
    return prisma.sinhVien.findMany({
      where: { lop_id: lopId },
      select: {
        id: true,
        nguoi_dung_id: true,
        mssv: true,
        lop_id: true
      }
    });
  }

  async getActivityTypes() {
    return prisma.loaiHoatDong.findMany({
      select: {
        id: true,
        ten_loai_hd: true,
        diem_toi_da: true
      }
    });
  }

  async getStudentRegistrations(svId, activityFilter = {}) {
    return prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: svId,
        hoat_dong: activityFilter
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      }
    });
  }

  async getUpcomingActivities(svId, classCreators = [], semesterFilter = {}) {
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
    });
  }

  async getUnreadNotificationsCount(userId) {
    return prisma.thongBao.count({
      where: {
        nguoi_nhan_id: userId,
        da_doc: false
      }
    });
  }

  async getActivityStatsByTimeRange(fromDate) {
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
    });
  }

  async getTotalActivitiesCount(fromDate) {
    return prisma.hoatDong.count({
      where: {
        ngay_tao: {
          gte: fromDate
        }
      }
    });
  }

  async getTotalRegistrationsCount(fromDate) {
    return prisma.dangKyHoatDong.count({
      where: {
        ngay_dang_ky: {
          gte: fromDate
        }
      }
    });
  }

  async getAdminOverviewStats() {
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
}

module.exports = DashboardPrismaRepository;

