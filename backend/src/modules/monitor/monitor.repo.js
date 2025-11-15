/**
 * Monitor Repository - Pure Data Access Layer
 * Handles all database operations for class monitor features
 */

const { prisma } = require('../../infrastructure/prisma/client');

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
        trang_thai_dk: 'da_tham_gia',
        hoat_dong: activityFilter && Object.keys(activityFilter).length ? { is: activityFilter } : undefined
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
   * Find ALL registrations of a class for points aggregation (participated only)
   */
  async findClassRegistrationsForPoints(classId, activityFilter) {
    return await prisma.dangKyHoatDong.findMany({
      where: {
        sinh_vien: { lop_id: classId },
        trang_thai_dk: 'da_tham_gia',
        hoat_dong: activityFilter && Object.keys(activityFilter).length ? { is: activityFilter } : undefined
      },
      select: {
        sv_id: true,
        ngay_dang_ky: true,
        hoat_dong: { 
          select: { 
            id: true,
            diem_rl: true,
            ngay_bd: true,
            loai_hd: { select: { ten_loai_hd: true } }
          } 
        },
        sinh_vien: {
          select: {
            id: true,
            mssv: true,
            nguoi_dung: { select: { ho_ten: true } }
          }
        }
      },
      orderBy: { ngay_dang_ky: 'asc' }
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
      whereClause.hoat_dong = { is: activityFilter };
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
            id: true,
            ten_hd: true, 
            ngay_bd: true, 
            diem_rl: true, 
            dia_diem: true, 
            hinh_anh: true,
            loai_hd: { select: { id: true, ten_loai_hd: true } }
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
      where.hoat_dong = { is: activityFilter };
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
        hoat_dong: activityFilter && Object.keys(activityFilter).length ? { is: activityFilter } : undefined
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
   * Find upcoming activities for class (only class activities)
   */
  async findUpcomingActivities(classId, activityFilter, limit = 5) {
    const now = new Date();
    
    return await prisma.hoatDong.findMany({
      where: {
        ngay_bd: { gte: now },
        trang_thai: 'da_duyet',
        ...activityFilter, // activityFilter already includes nguoi_tao_id filter
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
   * Find class by ID
   */
  async findClassById(classId) {
    return await prisma.lop.findUnique({
      where: { id: classId },
      select: {
        id: true,
        ten_lop: true,
        chu_nhiem: true
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
        hoat_dong: { is: { ...(activityFilter || {}), trang_thai: { in: ['da_duyet', 'ket_thuc'] } } },
        trang_thai_dk: 'da_duyet'
      },
      select: {
        hd_id: true
      }
    });
  }

  /**
   * Find class registrations for counting distinct activities with status da_duyet only
   * Used for reports to match the "Có sẵn" tab logic
   */
  async findClassRegistrationsForCountApproved(classId, activityFilter) {
    return await prisma.dangKyHoatDong.findMany({
      where: {
        sinh_vien: { lop_id: classId },
        hoat_dong: { is: { ...(activityFilter || {}), trang_thai: 'da_duyet' } },
        trang_thai_dk: 'da_duyet'
      },
      select: {
        hd_id: true
      }
    });
  }

  /**
   * Count activities with status da_duyet in semester (for class)
   * Counts activities directly from hoatDong table with semester filter
   * This matches the logic of "Có sẵn" tab in class activities page
   */
  async countApprovedActivitiesForClass(classId, activityFilter) {
    // Get class creators (students + homeroom teacher) for filtering
    const classStudents = await this.findAllStudentsInClass(classId);
    const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
    
    // Get homeroom teacher
    const lop = await this.findClassById(classId);
    if (lop?.chu_nhiem) {
      classCreatorUserIds.push(lop.chu_nhiem);
    }
    
    if (classCreatorUserIds.length === 0) {
      return 0;
    }
    
    // Build where clause: semester filter + status da_duyet + created by class
    // This matches exactly what the "Có sẵn" tab shows
    const hoatDongWhere = activityFilter && Object.keys(activityFilter).length > 0
      ? {
          AND: [
            activityFilter, // Semester filter (may contain OR)
            { trang_thai: 'da_duyet' },
            { nguoi_tao_id: { in: classCreatorUserIds } }
          ]
        }
      : {
          AND: [
            { trang_thai: 'da_duyet' },
            { nguoi_tao_id: { in: classCreatorUserIds } }
          ]
        };

    // Count directly from hoatDong table
    const count = await prisma.hoatDong.count({
      where: hoatDongWhere
    });

    // Log for debugging
    const { logInfo } = require('../../core/logger');
    logInfo('countApprovedActivitiesForClass', {
      classId,
      classCreatorUserIdsCount: classCreatorUserIds.length,
      activityFilter: JSON.stringify(activityFilter),
      hoatDongWhere: JSON.stringify(hoatDongWhere),
      count
    });

    return count;
  }

  /**
   * Count class-created activities in a strict semester (no status constraint)
   * Matches the Activities list page total which filters by exact hoc_ky/nam_hoc
   */
  async countActivitiesForClassStrict(classId, semesterWhere) {
    // Get class creators (students + homeroom teacher)
    const classStudents = await this.findAllStudentsInClass(classId);
    const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);

    const lop = await this.findClassById(classId);
    if (lop?.chu_nhiem) {
      classCreatorUserIds.push(lop.chu_nhiem);
    }

    if (classCreatorUserIds.length === 0) return 0;

    const where = {
      AND: [
        semesterWhere || {},
        { nguoi_tao_id: { in: classCreatorUserIds } }
      ]
    };

    const count = await prisma.hoatDong.count({ where });

    const { logInfo } = require('../../core/logger');
    logInfo('countActivitiesForClassStrict', {
      classId,
      classCreatorUserIdsCount: classCreatorUserIds.length,
      semesterWhere: JSON.stringify(semesterWhere),
      count
    });

    return count;
  }

  /**
   * Find class registrations for reports
   * Filters by semester and activity status
   */
  async findClassRegistrationsForReports(classId, activityFilter) {
    // Build where clause for hoat_dong
    // If activityFilter has OR (from buildRobustActivitySemesterWhere), we need to combine it with trang_thai filter
    const hoatDongWhere = activityFilter && Object.keys(activityFilter).length > 0
      ? { AND: [ activityFilter, { trang_thai: { in: ['da_duyet', 'ket_thuc'] } } ] }
      : { trang_thai: { in: ['da_duyet', 'ket_thuc'] } };

    return await prisma.dangKyHoatDong.findMany({
      where: {
        sinh_vien: { lop_id: classId },
        hoat_dong: { is: hoatDongWhere }
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            diem_rl: true,
            ngay_bd: true,
            hoc_ky: true,
            nam_hoc: true,
            loai_hd: { select: { ten_loai_hd: true } }
          }
        },
        sinh_vien: { 
          select: { 
            id: true, 
            mssv: true, 
            nguoi_dung: { select: { ho_ten: true } } 
          } 
        }
      }
    });
  }
}

module.exports = new MonitorRepository();





