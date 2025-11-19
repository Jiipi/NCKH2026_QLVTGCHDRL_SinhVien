const { prisma } = require('../../../../infrastructure/prisma/client');
const { parseSemesterString } = require('../../../../core/utils/semester');
const IPointsRepository = require('../../domain/interfaces/IPointsRepository');

/**
 * PointsPrismaRepository
 * Prisma implementation of IPointsRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class PointsPrismaRepository extends IPointsRepository {
  async findStudentByUserId(userId) {
    return await prisma.sinhVien.findUnique({
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
            ten_lop: true,
            khoa: true,
            nien_khoa: true
          }
        }
      }
    });
  }

  async findAttendedRegistrations(studentId, filters = {}) {
    const { semester } = filters;
    
    const where = {
      sv_id: studentId,
      trang_thai_dk: 'da_tham_gia'
    };

    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        where.hoat_dong = {
          hoc_ky: parsed.semester,
          nam_hoc: parsed.year
        };
      }
    }

    return await prisma.dangKyHoatDong.findMany({
      where,
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      }
    });
  }

  async findAllRegistrations(studentId) {
    return await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: studentId
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
      },
      take: 10
    });
  }

  async getRegistrationStatusCounts(studentId) {
    return await prisma.dangKyHoatDong.groupBy({
      by: ['trang_thai_dk'],
      where: {
        sv_id: studentId
      },
      _count: {
        id: true
      }
    });
  }

  async findRegistrationsWithPagination(studentId, filters, pagination) {
    const { semester } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereCondition = { sv_id: studentId };
    
    let where = whereCondition;
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        where = { 
          ...whereCondition, 
          hoat_dong: {
            hoc_ky: parsed.semester,
            nam_hoc: parsed.year
          }
        };
      }
    }

    const [registrations, total] = await Promise.all([
      prisma.dangKyHoatDong.findMany({
        where,
        include: {
          hoat_dong: { include: { loai_hd: true } }
        },
        orderBy: {
          ngay_dang_ky: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.dangKyHoatDong.count({ where })
    ]);

    return { registrations, total };
  }

  async findAttendanceRecords(studentId, pagination) {
    const { page = 1, limit = 10 } = pagination;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [attendances, total] = await Promise.all([
      prisma.diemDanh.findMany({
        where: {
          sv_id: studentId
        },
        include: {
          hoat_dong: {
            include: {
              loai_hd: true
            }
          },
          nguoi_diem_danh: {
            select: {
              ho_ten: true,
              email: true
            }
          }
        },
        orderBy: {
          tg_diem_danh: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.diemDanh.count({
        where: {
          sv_id: studentId
        }
      })
    ]);

    return { attendances, total };
  }

  async getUniqueSemesters(studentId) {
    const hocKyData = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: studentId,
        trang_thai_dk: 'da_tham_gia'
      },
      select: {
        hoat_dong: {
          select: {
            hoc_ky: true
          }
        }
      }
    });

    return hocKyData
      .map(item => item.hoat_dong.hoc_ky)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  async getUniqueAcademicYears(studentId) {
    const namHocData = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: studentId,
        trang_thai_dk: 'da_tham_gia'
      },
      select: {
        hoat_dong: {
          select: {
            nam_hoc: true
          }
        }
      }
    });

    return namHocData
      .map(item => item.hoat_dong.nam_hoc)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort((a, b) => b.localeCompare(a));
  }

  async findCompletedRegistrationsForSemester(studentId, hocKy, namHoc = null) {
    const whereCondition = {
      sv_id: studentId,
      trang_thai_dk: 'da_tham_gia',
      hoat_dong: {
        trang_thai: 'ket_thuc',
        hoc_ky: hocKy
      }
    };

    if (namHoc) {
      whereCondition.hoat_dong.nam_hoc = namHoc;
    }

    return await prisma.dangKyHoatDong.findMany({
      where: whereCondition,
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      }
    });
  }
}

module.exports = PointsPrismaRepository;

