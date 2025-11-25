const { prisma } = require('../../../../data/infrastructure/prisma/client');

/**
 * Exports Repository
 * Data access layer for export operations
 * Follows Repository Pattern
 */
class ExportsRepository {
  async groupActivitiesByStatus(activityWhere) {
    return await prisma.hoatDong.groupBy({ 
      by: ['trang_thai'], 
      where: activityWhere, 
      _count: { _all: true } 
    });
  }

  async findTopActivities(activityWhere, limit = 20) {
    return await prisma.hoatDong.findMany({
      where: activityWhere,
      select: { 
        id: true, 
        ten_hd: true, 
        ngay_bd: true, 
        dang_ky_hd: { 
          select: { id: true } 
        } 
      },
      orderBy: { ngay_bd: 'desc' },
      take: limit
    });
  }

  async groupRegistrationsByDate(activityWhere) {
    return await prisma.dangKyHoatDong.groupBy({
      by: ['ngay_dang_ky'],
      where: { hoat_dong: activityWhere },
      _count: { _all: true }
    });
  }

  async findActivitiesForExport(activityWhere, useOrderBy = true) {
    const query = {
      where: activityWhere,
      select: {
        ma_hd: true,
        ten_hd: true,
        diem_rl: true,
        trang_thai: true,
        ngay_bd: true,
        ngay_kt: true,
        loai_hd: { select: { ten_loai_hd: true } }
      }
    };

    if (useOrderBy) {
      query.orderBy = { ngay_bd: 'desc' };
    }

    return await prisma.hoatDong.findMany(query);
  }

  async findRegistrationsForExport(activityWhere, limit = 5000) {
    return await prisma.dangKyHoatDong.findMany({
      where: { hoat_dong: activityWhere },
      include: { 
        sinh_vien: { 
          include: { 
            nguoi_dung: true 
          } 
        }, 
        hoat_dong: true 
      },
      orderBy: { ngay_dang_ky: 'desc' },
      take: limit
    });
  }
}

module.exports = new ExportsRepository();

