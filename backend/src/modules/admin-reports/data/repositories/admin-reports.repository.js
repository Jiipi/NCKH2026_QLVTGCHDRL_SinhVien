const { prisma } = require('../../../../data/infrastructure/prisma/client');

class AdminReportsRepository {
  async groupActivitiesByStatus(where) {
    return prisma.hoatDong.groupBy({ by: ['trang_thai'], where, _count: { _all: true } });
  }

  async findTopActivities(where) {
    return prisma.hoatDong.findMany({
      where,
      select: { id: true, ten_hd: true, ngay_bd: true, dang_ky_hd: { select: { id: true } } },
      orderBy: { ngay_bd: 'desc' },
      take: 20,
    });
  }

  async groupRegistrationsByDate(where) {
    return prisma.dangKyHoatDong.groupBy({
      by: ['ngay_dang_ky'],
      where: { hoat_dong: where },
      _count: { _all: true },
    });
  }

  async findActivitiesForExport(where) {
    try {
      return await prisma.hoatDong.findMany({
        where,
        select: {
          id: true,
          ma_hd: true,
          ten_hd: true,
          diem_rl: true,
          trang_thai: true,
          ngay_bd: true,
          ngay_kt: true,
          loai_hd: { select: { ten_loai_hd: true } },
        },
        orderBy: { ngay_bd: 'desc' },
      });
    } catch (qErr) {
      console.warn('findActivitiesForExport query failed, retrying without orderBy', qErr?.message);
      return prisma.hoatDong.findMany({
        where,
        select: {
          id: true,
          ma_hd: true,
          ten_hd: true,
          diem_rl: true,
          trang_thai: true,
          ngay_bd: true,
          ngay_kt: true,
          loai_hd: { select: { ten_loai_hd: true } },
        },
      });
    }
  }

  async findRegistrationsForExport(where) {
    return prisma.dangKyHoatDong.findMany({
      where: { hoat_dong: where },
      include: { sinh_vien: { include: { nguoi_dung: true } }, hoat_dong: true },
      orderBy: { ngay_dang_ky: 'desc' },
      take: 5000,
    });
  }

  async findUserWithStudent(userId) {
    return prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async findRegistrationsByStudent(svId) {
    return prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: svId,
        trang_thai_dk: { in: ['da_tham_gia', 'da_duyet'] }
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      },
      orderBy: { ngay_dang_ky: 'desc' }
    });
  }

  async findAttendanceByStudent(svId) {
    return prisma.diemDanh.findMany({
      where: {
        sv_id: svId
      },
      include: {
        hoat_dong: true
      },
      orderBy: { tg_diem_danh: 'desc' }
    });
  }

  async findAttendanceWithFilters(whereCondition, skip, take) {
    const [attendanceList, total] = await Promise.all([
      prisma.diemDanh.findMany({
        where: whereCondition,
        include: {
          sinh_vien: {
            include: {
              nguoi_dung: true,
              lop: true
            }
          },
          hoat_dong: {
            include: {
              loai_hd: true
            }
          },
          nguoi_diem_danh: true
        },
        skip,
        take,
        orderBy: { tg_diem_danh: 'desc' }
      }),
      prisma.diemDanh.count({ where: whereCondition })
    ]);

    return { attendanceList, total };
  }

  async findAllClasses() {
    return prisma.lop.findMany({
      select: {
        id: true,
        ten_lop: true,
        khoa: true,
        nien_khoa: true,
        _count: {
          select: { sinh_viens: true }
        }
      },
      orderBy: [
        { khoa: 'asc' },
        { ten_lop: 'asc' }
      ]
    });
  }

  async getAttendanceStats() {
    const [total, coMat, vangMat, muon, veSom] = await Promise.all([
      prisma.diemDanh.count(),
      prisma.diemDanh.count({ where: { trang_thai_tham_gia: 'co_mat' } }),
      prisma.diemDanh.count({ where: { trang_thai_tham_gia: 'vang_mat' } }),
      prisma.diemDanh.count({ where: { trang_thai_tham_gia: 'muon' } }),
      prisma.diemDanh.count({ where: { trang_thai_tham_gia: 've_som' } })
    ]);
    return { total, coMat, vangMat, muon, veSom };
  }
}

module.exports = new AdminReportsRepository();

