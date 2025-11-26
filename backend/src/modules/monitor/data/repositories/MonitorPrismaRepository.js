const { prisma } = require('../../../../data/infrastructure/prisma/client');
const IMonitorRepository = require('../../business/interfaces/IMonitorRepository');
const { logInfo } = require('../../../../core/logger');

/**
 * MonitorPrismaRepository
 * Prisma implementation of IMonitorRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class MonitorPrismaRepository extends IMonitorRepository {
  async findStudentsByClass(classId) {
    return await prisma.sinhVien.findMany({
      where: { lop_id: classId },
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

  async countPendingRegistrations(classId) {
    return await prisma.dangKyHoatDong.count({
      where: { 
        trang_thai_dk: 'cho_duyet', 
        sinh_vien: { lop_id: classId }
      }
    });
  }

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

  async updateRegistrationStatus(registrationId, status, additionalData = {}) {
    return await prisma.dangKyHoatDong.update({
      where: { id: registrationId },
      data: {
        trang_thai_dk: status,
        ngay_duyet: new Date(),
        nguoi_duyet_id: additionalData.nguoi_duyet_id || null,
        ...additionalData
      }
    });
  }

  async createNotification(data) {
    return await prisma.thongBao.create({ data });
  }

  async findNotificationTypeByName(name) {
    return await prisma.loaiThongBao.findFirst({ 
      where: { ten_loai_tb: name } 
    });
  }

  async findFirstNotificationType() {
    return await prisma.loaiThongBao.findFirst();
  }

  async countStudentsByClass(classId) {
    return await prisma.sinhVien.count({
      where: { lop_id: classId }
    });
  }

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

  async findUpcomingActivities(classId, activityFilter, limit = 5) {
    const now = new Date();
    
    return await prisma.hoatDong.findMany({
      where: {
        ngay_bd: { gte: now },
        trang_thai: 'da_duyet',
        ...activityFilter,
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

  async findAllStudentsInClass(classId) {
    return await prisma.sinhVien.findMany({
      where: { lop_id: classId },
      include: {
        nguoi_dung: { select: { ho_ten: true } }
      },
      orderBy: { mssv: 'asc' }
    });
  }

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

  async countActivitiesForClassStrict(classId, semesterWhere) {
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
        { nguoi_tao_id: { in: classCreatorUserIds } },
        // Chỉ đếm hoạt động đã được duyệt/kết thúc
        { trang_thai: { in: ['da_duyet', 'ket_thuc'] } }
      ]
    };

    const count = await prisma.hoatDong.count({ where });

    logInfo('countActivitiesForClassStrict', {
      classId,
      classCreatorUserIdsCount: classCreatorUserIds.length,
      semesterWhere: JSON.stringify(semesterWhere),
      count
    });

    return count;
  }

  async findClassRegistrationsForReports(classId, activityFilter) {
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

module.exports = MonitorPrismaRepository;

