/**
 * Exports Repository
 * Data access layer for export operations
 * Follows Repository Pattern
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { Prisma } from '@prisma/client';
import type {
  IExportRepository,
  StatusGroupResult,
  TopActivityResult,
  DailyRegResult,
  ActivityExportRow,
  RegistrationExportRow,
  ActivityWhereInput
} from '../../business/interfaces/IExportRepository';

class ExportsRepository implements IExportRepository {
  async groupActivitiesByStatus(activityWhere: ActivityWhereInput): Promise<StatusGroupResult[]> {
    const where = activityWhere as Prisma.HoatDongWhereInput;
    return await prisma.hoatDong.groupBy({ 
      by: ['trang_thai'], 
      where, 
      _count: { _all: true } 
    }) as unknown as StatusGroupResult[];
  }

  async findTopActivities(activityWhere: ActivityWhereInput, limit: number = 20): Promise<TopActivityResult[]> {
    const where = activityWhere as Prisma.HoatDongWhereInput;
    return await prisma.hoatDong.findMany({
      where,
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
    }) as unknown as TopActivityResult[];
  }

  async groupRegistrationsByDate(activityWhere: ActivityWhereInput): Promise<DailyRegResult[]> {
    const where = activityWhere as Prisma.HoatDongWhereInput;
    return await prisma.dangKyHoatDong.groupBy({
      by: ['ngay_dang_ky'],
      where: { hoat_dong: where },
      _count: { _all: true }
    }) as unknown as DailyRegResult[];
  }

  async findActivitiesForExport(activityWhere: ActivityWhereInput, useOrderBy: boolean = true): Promise<ActivityExportRow[]> {
    const where = activityWhere as Prisma.HoatDongWhereInput;
    const query: Prisma.HoatDongFindManyArgs = {
      where,
      select: {
        id: true,
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

    return await prisma.hoatDong.findMany(query) as unknown as ActivityExportRow[];
  }

  async findRegistrationsForExport(activityWhere: ActivityWhereInput, limit: number = 5000): Promise<RegistrationExportRow[]> {
    const where = activityWhere as Prisma.HoatDongWhereInput;
    return await prisma.dangKyHoatDong.findMany({
      where: { hoat_dong: where },
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
    }) as unknown as RegistrationExportRow[];
  }
}

const exportsRepository = new ExportsRepository();
export default exportsRepository;
module.exports = exportsRepository;
