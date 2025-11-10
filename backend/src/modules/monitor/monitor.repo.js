/**
 * Monitor Repository - Pure Data Access Layer
 * Handles all database operations for class monitor features
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MonitorRepository {
  /**
   * Find all students in a class
   */
  async findStudentsByClass(classId) {
    return await prisma.sinhVien.findMany({
      where: {
        lop_id: classId,
      },
      include: {
        nguoi_dung: {
          select: {
            ho_ten: true,
            email: true,
            anh_dai_dien: true
          },
        },
        lop: {
          select: {
            ten_lop: true,
            khoa: true,
          },
        },
      },
    });
  }

  /**
   * Find student registrations with activity filter
   */
  async findStudentRegistrations(studentId, activityFilter) {
    return await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: studentId,
        trang_thai_dk: {
          in: ['da_tham_gia', 'da_duyet'] // ✅ Include both approved and completed
        },
        hoat_dong: activityFilter
      },
      include: {
        hoat_dong: {
          select: {
            ten_hd: true,
            diem_rl: true,
            ngay_bd: true,
            ngay_kt: true,
          },
        },
      },
    });
  }

  /**
   * Find registrations for class
   */
  async findClassRegistrations(classId, filters = {}) {
    const { status, activityFilter } = filters;
    
    const whereClause = {
      sinh_vien: { lop_id: classId }
    };

    if (status && status !== 'all') {
      whereClause.trang_thai_dk = status;
    }

    if (activityFilter && Object.keys(activityFilter).length) {
      whereClause.hoat_dong = activityFilter;
    }

    return await prisma.dangKyHoatDong.findMany({
      where: whereClause,
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
            ten_hd: true, 
            ngay_bd: true, 
            diem_rl: true, 
            dia_diem: true, 
            hinh_anh: true 
          } 
        }
      },
      orderBy: { ngay_dang_ky: 'desc' },
      take: 500
    });
  }

  /**
   * Count pending registrations
   */
  async countPendingRegistrations(classId) {
    return await prisma.dangKyHoatDong.count({
      where: { 
        trang_thai_dk: 'cho_duyet', 
        sinh_vien: { lop_id: classId }
      }
    });
  }

  /**
   * Find registration by ID with full details
   */
  async findRegistrationById(registrationId) {
    return await prisma.dangKyHoatDong.findUnique({
      where: { id: registrationId },
      include: {
        sinh_vien: { 
          include: { 
            nguoi_dung: true, 
            lop: true 
          } 
        },
        hoat_dong: { 
          select: { 
            ten_hd: true, 
            hoc_ky: true, 
            nam_hoc: true 
          } 
        }
      }
    });
  }

  /**
   * Update registration status
   */
  async updateRegistrationStatus(registrationId, status, additionalData = {}) {
    return await prisma.dangKyHoatDong.update({
      where: { id: registrationId },
      data: {
        trang_thai_dk: status,
        ngay_duyet: new Date(),
        ...additionalData
      }
    });
  }

  /**
   * Create notification
   */
  async createNotification(data) {
    return await prisma.thongBao.create({ data });
  }

  /**
   * Find notification type by name
   */
  async findNotificationTypeByName(name) {
    return await prisma.loaiThongBao.findFirst({ 
      where: { ten_loai_tb: name } 
    });
  }

  /**
   * Find first notification type
   */
  async findFirstNotificationType() {
    return await prisma.loaiThongBao.findFirst();
  }

  /**
   * Count total students in class
   */
  async countStudentsByClass(classId) {
    return await prisma.sinhVien.count({
      where: { lop_id: classId }
    });
  }

  /**
   * Count registrations with filters
   */
  async countRegistrations(classId, filters = {}) {
    const { status, activityFilter } = filters;
    
    const where = {
      sinh_vien: { lop_id: classId }
    };

    if (status) {
      where.trang_thai_dk = status;
    }

    if (activityFilter && Object.keys(activityFilter).length) {
      where.hoat_dong = activityFilter;
    }

    return await prisma.dangKyHoatDong.count({ where });
  }

  /**
   * Find recent registrations
   */
  async findRecentRegistrations(classId, activityFilter, limit = 5) {
    return await prisma.dangKyHoatDong.findMany({
      where: {
        sinh_vien: { lop_id: classId },
        hoat_dong: activityFilter
      },
      include: {
        sinh_vien: {
          include: {
            nguoi_dung: { select: { ho_ten: true } }
          }
        },
        hoat_dong: {
          select: { ten_hd: true, ngay_bd: true, diem_rl: true }
        }
      },
      orderBy: { ngay_dang_ky: 'desc' },
      take: limit
    });
  }

  /**
   * Find upcoming activities for class
   */
  async findUpcomingActivities(classId, activityFilter, limit = 5) {
    const now = new Date();
    
    return await prisma.hoatDong.findMany({
      where: {
        ngay_bd: { gte: now },
        trang_thai: 'da_duyet',
        ...activityFilter,
        dang_ky_hd: {
          some: {
            sinh_vien: { lop_id: classId }
          }
        }
      },
      orderBy: { ngay_bd: 'asc' },
      take: limit,
      select: {
        id: true,
        ten_hd: true,
        ngay_bd: true,
        ngay_kt: true,
        diem_rl: true,
        dia_diem: true,
        don_vi_to_chuc: true,
        loai_hd: {
          select: { ten_loai_hd: true }
        },
        _count: {
          select: {
            dang_ky_hd: {
              where: {
                sinh_vien: { lop_id: classId }
              }
            }
          }
        }
      }
    });
  }

  /**
   * Find all students in class (minimal data)
   */
  async findAllStudentsInClass(classId) {
    return await prisma.sinhVien.findMany({
      where: { lop_id: classId },
      include: {
        nguoi_dung: { select: { ho_ten: true } }
      },
      orderBy: { mssv: 'asc' }
    });
  }

  /**
   * Find class registrations for counting distinct activities
   */
  async findClassRegistrationsForCount(classId, activityFilter) {
    return await prisma.dangKyHoatDong.findMany({
      where: {
        sinh_vien: { lop_id: classId },
        hoat_dong: {
          ...activityFilter,
          trang_thai: { in: ['da_duyet', 'ket_thuc'] }
        },
        trang_thai_dk: 'da_duyet'
      },
      select: {
        hd_id: true
      }
    });
  }
}

module.exports = new MonitorRepository();
