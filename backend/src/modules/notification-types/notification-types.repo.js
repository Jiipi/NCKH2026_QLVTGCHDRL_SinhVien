/**
 * Notification Types Repository - Pure Data Access Layer
 * Handles all database operations for notification types
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificationTypesRepository {
  /**
   * Find all notification types
   */
  async findAll(orderBy = { ten_loai_tb: 'asc' }) {
    return await prisma.loaiThongBao.findMany({ 
      orderBy,
      include: {
        _count: {
          select: { thong_baos: true }
        }
      }
    });
  }

  /**
   * Find notification type by ID
   */
  async findById(id) {
    return await prisma.loaiThongBao.findUnique({
      where: { id },
      include: {
        _count: {
          select: { thong_baos: true }
        }
      }
    });
  }

  /**
   * Find notification type by name (case-insensitive)
   */
  async findByName(name, excludeId = null) {
    const where = { 
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

  /**
   * Create notification type
   */
  async create(data) {
    return await prisma.loaiThongBao.create({ 
      data: { 
        ten_loai_tb: data.ten_loai_tb.trim(), 
        mo_ta: data.mo_ta?.trim() || null 
      } 
    });
  }

  /**
   * Update notification type
   */
  async update(id, data) {
    return await prisma.loaiThongBao.update({
      where: { id },
      data: {
        ten_loai_tb: data.ten_loai_tb.trim(),
        mo_ta: data.mo_ta?.trim() || null
      }
    });
  }

  /**
   * Delete notification type
   */
  async delete(id) {
    return await prisma.loaiThongBao.delete({ where: { id } });
  }

  /**
   * Count notifications using this type
   */
  async countNotificationsUsingType(typeId) {
    return await prisma.thongBao.count({
      where: { loai_tb_id: typeId }
    });
  }
}

module.exports = new NotificationTypesRepository();
