const { prisma } = require('../../../../data/infrastructure/prisma/client');

/**
 * Notification Types Repository
 * Data access layer for notification types
 * Follows Repository Pattern
 */
class NotificationTypesRepository {
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

  async create(data) {
    return await prisma.loaiThongBao.create({ 
      data: { 
        ten_loai_tb: data.ten_loai_tb.trim(), 
        mo_ta: data.mo_ta?.trim() || null 
      } 
    });
  }

  async update(id, data) {
    return await prisma.loaiThongBao.update({
      where: { id },
      data: {
        ten_loai_tb: data.ten_loai_tb.trim(),
        mo_ta: data.mo_ta?.trim() || null
      }
    });
  }

  async delete(id) {
    return await prisma.loaiThongBao.delete({ where: { id } });
  }

  async countNotificationsUsingType(typeId) {
    return await prisma.thongBao.count({
      where: { loai_tb_id: typeId }
    });
  }
}

module.exports = new NotificationTypesRepository();

