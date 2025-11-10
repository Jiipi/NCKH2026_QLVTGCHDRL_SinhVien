const { prisma } = require('../../config/database');

/**
 * Dashboard Repository
 * Handles data access for dashboard statistics and summaries
 */
class DashboardRepository {
  /**
   * Get student information with class and user details
   */
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

  /**
   * Get all students in a class
   */
  async getClassStudents(lopId) {
    return prisma.sinhVien.findMany({
      where: { lop_id: lopId },
      select: {
        id: true,
        nguoi_dung_id: true,
        mssv: true
      }
    });
  }

  /**
   * Get activity types with max points
   */
  async getActivityTypes() {
    return prisma.loaiHoatDong.findMany({
      select: {
        id: true,
        ten_loai_hd: true,
        diem_toi_da: true
      }
    });
  }

  /**
   * Get student registrations with filter
   */
  async getStudentRegistrations(svId, activityFilter = {}) {
    return prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: svId,
        // Get ALL registration statuses (cho_duyet, da_duyet, da_tham_gia, tu_choi)
        hoat_dong: activityFilter
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      },
      orderBy: {
        ngay_dang_ky: 'desc'
      }
    });
  }

  /**
   * Get student attendances with filter
   */
  async getStudentAttendances(svId, activityFilter = {}) {
    return prisma.diemDanh.findMany({
      where: {
        sv_id: svId,
        xac_nhan_tham_gia: true,
        hoat_dong: activityFilter
      },
      include: {
        hoat_dong: true
      }
    });
  }

  /**
   * Get upcoming activities for student
   */
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

  /**
   * Get unread notifications count
   */
  async getUnreadNotificationsCount(userId) {
    return prisma.thongBao.count({
      where: {
        nguoi_nhan_id: userId,
        da_doc: false
      }
    });
  }

  /**
   * Get activity statistics by time range
   */
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

  /**
   * Get total activities count by time range
   */
  async getTotalActivitiesCount(fromDate) {
    return prisma.hoatDong.count({
      where: {
        ngay_tao: {
          gte: fromDate
        }
      }
    });
  }

  /**
   * Get total registrations count by time range
   */
  async getTotalRegistrationsCount(fromDate) {
    return prisma.dangKyHoatDong.count({
      where: {
        ngay_dang_ky: {
          gte: fromDate
        }
      }
    });
  }
}

module.exports = new DashboardRepository();
