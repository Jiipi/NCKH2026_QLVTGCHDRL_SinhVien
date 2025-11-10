/**
 * Notifications Repository
 * Data access layer for notification operations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificationsRepository {
  /**
   * Find notifications with pagination and filters
   */
  async findNotifications(filters, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const { nguoi_nhan_id, nguoi_gui_id, unread_only = false } = filters;

    const where = {};
    
    if (nguoi_nhan_id) {
      where.nguoi_nhan_id = nguoi_nhan_id;
    }
    
    if (nguoi_gui_id) {
      where.nguoi_gui_id = nguoi_gui_id;
    }
    
    if (unread_only === true || unread_only === 'true') {
      where.da_doc = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.thongBao.findMany({
        where,
        include: {
          loai_tb: true,
          nguoi_gui: {
            select: {
              id: true,
              ho_ten: true,
              email: true
            }
          },
          nguoi_nhan: {
            select: {
              id: true,
              ho_ten: true,
              email: true
            }
          }
        },
        orderBy: {
          ngay_gui: 'desc'
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.thongBao.count({ where })
    ]);

    return { notifications, total };
  }

  /**
   * Find notification by ID
   */
  async findById(notificationId) {
    return await prisma.thongBao.findUnique({
      where: { id: notificationId },
      include: {
        loai_tb: true,
        nguoi_gui: {
          select: {
            id: true,
            ho_ten: true,
            email: true
          }
        },
        nguoi_nhan: {
          select: {
            id: true,
            ho_ten: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Find notification by ID and user (for authorization)
   */
  async findByIdForUser(notificationId, userId, type = 'received') {
    const where = {
      id: notificationId
    };

    if (type === 'received') {
      where.nguoi_nhan_id = userId;
    } else if (type === 'sent') {
      where.nguoi_gui_id = userId;
    }

    return await prisma.thongBao.findFirst({
      where,
      include: {
        loai_tb: true,
        nguoi_gui: {
          select: {
            id: true,
            ho_ten: true,
            email: true
          }
        },
        nguoi_nhan: {
          select: {
            id: true,
            ho_ten: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Get unread count for user
   */
  async countUnread(userId) {
    return await prisma.thongBao.count({
      where: {
        nguoi_nhan_id: userId,
        da_doc: false
      }
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    return await prisma.thongBao.update({
      where: { id: notificationId },
      data: {
        da_doc: true,
        ngay_doc: new Date()
      }
    });
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    return await prisma.thongBao.updateMany({
      where: {
        nguoi_nhan_id: userId,
        da_doc: false
      },
      data: {
        da_doc: true,
        ngay_doc: new Date()
      }
    });
  }

  /**
   * Delete notification
   */
  async delete(notificationId) {
    return await prisma.thongBao.delete({
      where: { id: notificationId }
    });
  }

  /**
   * Create single notification
   */
  async create(data) {
    return await prisma.thongBao.create({
      data,
      include: {
        loai_tb: true,
        nguoi_gui: {
          select: {
            id: true,
            ho_ten: true,
            email: true
          }
        },
        nguoi_nhan: {
          select: {
            id: true,
            ho_ten: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Create multiple notifications (batch)
   */
  async createMany(dataArray) {
    return await prisma.thongBao.createMany({
      data: dataArray
    });
  }

  /**
   * Get sent notifications within time window (for grouping)
   */
  async findSentNotificationsBatch(userId, title, timestamp, windowMs = 60000) {
    return await prisma.thongBao.findMany({
      where: {
        nguoi_gui_id: userId,
        tieu_de: title,
        ngay_gui: {
          gte: new Date(timestamp.getTime() - windowMs),
          lte: new Date(timestamp.getTime() + windowMs)
        }
      },
      include: {
        nguoi_nhan: {
          select: {
            id: true,
            ho_ten: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Get activity by ID or code
   */
  async findActivity(criteria) {
    return await prisma.hoatDong.findFirst({
      where: criteria,
      select: {
        id: true,
        ma_hd: true,
        ten_hd: true,
        dia_diem: true,
        ngay_bd: true,
        ngay_kt: true,
        diem_rl: true,
        trang_thai: true,
        loai_hd: {
          select: {
            ten_loai_hd: true,
            mau_sac: true
          }
        }
      }
    });
  }

  /**
   * Get or create notification type
   */
  async getOrCreateNotificationType(loai_tb_id, defaultName = 'Thông báo chung') {
    if (loai_tb_id) {
      return await prisma.loaiThongBao.findUnique({
        where: { id: loai_tb_id }
      });
    }

    let loaiThongBao = await prisma.loaiThongBao.findFirst({
      where: { ten_loai_tb: defaultName }
    });

    if (!loaiThongBao) {
      loaiThongBao = await prisma.loaiThongBao.create({
        data: {
          ten_loai_tb: defaultName,
          mo_ta: 'Loại thông báo mặc định cho hệ thống'
        }
      });
    }

    return loaiThongBao;
  }

  /**
   * Get student's class IDs
   */
  async getStudentClassIds(userId) {
    const student = await prisma.sinhVien.findFirst({
      where: { nguoi_dung_id: userId },
      select: { lop_id: true }
    });

    return student?.lop_id ? [student.lop_id] : [];
  }

  /**
   * Get teacher's class IDs
   */
  async getTeacherClassIds(userId) {
    const classes = await prisma.lop.findMany({
      where: { chu_nhiem: userId },
      select: { id: true }
    });

    return classes.map(c => c.id);
  }

  /**
   * Get students by class IDs
   */
  async getStudentsByClassIds(classIds) {
    const students = await prisma.sinhVien.findMany({
      where: { lop_id: { in: classIds } },
      select: { nguoi_dung_id: true }
    });

    return students.map(s => s.nguoi_dung_id).filter(id => !!id);
  }

  /**
   * Get activity participants (approved registrations)
   */
  async getActivityParticipants(activityId) {
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: {
        hd_id: activityId,
        trang_thai_dk: { in: ['da_duyet', 'da_tham_gia'] }
      },
      select: {
        sinh_vien: {
          select: {
            nguoi_dung_id: true
          }
        }
      }
    });

    const recipientIds = registrations
      .map(r => r.sinh_vien?.nguoi_dung_id)
      .filter(Boolean);

    return Array.from(new Set(recipientIds));
  }
}

module.exports = new NotificationsRepository();
