import type { LoaiThongBao, Prisma } from '@prisma/client';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import type INotificationTypeRepository from '../../business/interfaces/INotificationTypeRepository';
import type {
  NotificationTypeOrderBy,
  NotificationTypeWithCount,
  CreateNotificationTypeData,
  UpdateNotificationTypeData
} from '../../business/interfaces/INotificationTypeRepository';

/**
 * Notification Types Repository
 * Data access layer for notification types
 * Follows Repository Pattern
 */
class NotificationTypesRepository implements INotificationTypeRepository {
  async findAll(orderBy: NotificationTypeOrderBy = { ten_loai_tb: 'asc' }): Promise<NotificationTypeWithCount[]> {
    return await prisma.loaiThongBao.findMany({ 
      orderBy: orderBy as Prisma.LoaiThongBaoOrderByWithRelationInput,
      include: {
        _count: {
          select: { thong_baos: true }
        }
      }
    });
  }

  async findById(id: string): Promise<NotificationTypeWithCount | null> {
    return await prisma.loaiThongBao.findUnique({
      where: { id },
      include: {
        _count: {
          select: { thong_baos: true }
        }
      }
    });
  }

  async findByName(name: string, excludeId: string | null = null): Promise<LoaiThongBao | null> {
    const where: Prisma.LoaiThongBaoWhereInput = { 
      ten_loai_tb: {
        equals: name.trim(),
        mode: 'insensitive'
      }
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return await prisma.loaiThongBao.findFirst({ where });
  }

  async create(data: CreateNotificationTypeData): Promise<LoaiThongBao> {
    return await prisma.loaiThongBao.create({ 
      data: { 
        ten_loai_tb: data.ten_loai_tb.trim(), 
        mo_ta: data.mo_ta?.trim() || null 
      } 
    });
  }

  async update(id: string, data: UpdateNotificationTypeData): Promise<LoaiThongBao> {
    return await prisma.loaiThongBao.update({
      where: { id },
      data: {
        ten_loai_tb: data.ten_loai_tb.trim(),
        mo_ta: data.mo_ta?.trim() || null
      }
    });
  }

  async delete(id: string): Promise<LoaiThongBao> {
    return await prisma.loaiThongBao.delete({ where: { id } });
  }

  async countNotificationsUsingType(typeId: string): Promise<number> {
    return await prisma.thongBao.count({
      where: { loai_tb_id: typeId }
    });
  }
}

const notificationTypesRepository = new NotificationTypesRepository();

export default notificationTypesRepository;
module.exports = notificationTypesRepository;
