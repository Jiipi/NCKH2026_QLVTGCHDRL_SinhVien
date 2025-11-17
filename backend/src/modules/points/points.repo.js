/**
 * Points Repository
 * Data access layer for student points and attendance operations
 */

const { prisma } = require('../../infrastructure/prisma/client');
const { parseSemesterString } = require('../../core/utils/semester');

class PointsRepository {
  /**
   * Find student by user ID
   */
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

  /**
   * Find attended activity registrations for student
   */
  async findAttendedRegistrations(studentId, filters = {}) {
    const { semester } = filters; // Accept semester param in new format
    
    const where = {
      sv_id: studentId,
      trang_thai_dk: 'da_tham_gia' // Only attended activities
    };

    // Use simple semester filter if provided
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

  /**
   * Find all registrations for student (any status)
   */
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

  /**
   * Get registration status counts
   */
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

  /**
   * Find registrations with pagination
   */
  async findRegistrationsWithPagination(studentId, filters, pagination) {
    const { semester } = filters; // Accept semester param in new format
    const { page = 1, limit = 10 } = pagination;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereCondition = { sv_id: studentId };
    
    // Use simple semester filter if provided
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

  /**
   * Find attendance records with pagination
   */
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

  /**
   * Get unique semesters for student (attended activities only)
   */
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

  /**
   * Get unique academic years for student (attended activities only)
   */
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
      .sort((a, b) => b.localeCompare(a)); // Sort descending
  }

  /**
   * Find completed registrations for semester report
   */
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

module.exports = new PointsRepository();





