const { prisma } = require('../infrastructure/prisma/client');

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
}

module.exports = new AdminReportsRepository();





