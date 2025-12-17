import { PrismaClient, ThongBao, LoaiThongBao, HoatDong } from '@prisma/client';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import INotificationRepository, {
  NotificationFilters,
  PaginationOptions,
  CreateNotificationData,
  ActivityCriteria,
  NotificationWithRelations
} from '../../business/interfaces/INotificationRepository';

interface UserSelect {
  id: true;
  ho_ten: true;
  email: true;
}

const userSelectFields: UserSelect = {
  id: true,
  ho_ten: true,
  email: true
};

/**
 * NotificationPrismaRepository
 * Prisma implementation of INotificationRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class NotificationPrismaRepository extends INotificationRepository {
  async findNotifications(
    filters: NotificationFilters,
    pagination: PaginationOptions = {}
  ): Promise<{ data: NotificationWithRelations[]; total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const { nguoi_nhan_id, nguoi_gui_id } = filters;
    const unread_only = (filters as { unread_only?: boolean | string }).unread_only;

    const where: Record<string, unknown> = {};

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
            select: userSelectFields
          },
          nguoi_nhan: {
            select: userSelectFields
          }
        },
        orderBy: {
          ngay_gui: 'desc'
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.thongBao.count({ where })
    ]);

    return { data: notifications as unknown as NotificationWithRelations[], total };
  }

  async findById(notificationId: string): Promise<NotificationWithRelations | null> {
    const result = await prisma.thongBao.findUnique({
      where: { id: notificationId },
      include: {
        loai_tb: true,
        nguoi_gui: {
          select: userSelectFields
        },
        nguoi_nhan: {
          select: userSelectFields
        }
      }
    });
    return result as unknown as NotificationWithRelations | null;
  }

  async findByIdForUser(
    notificationId: string,
    userId: string,
    type: 'sent' | 'received' = 'received'
  ): Promise<NotificationWithRelations | null> {
    const where: Record<string, unknown> = {
      id: notificationId
    };

    if (type === 'received') {
      where.nguoi_nhan_id = userId;
    } else if (type === 'sent') {
      where.nguoi_gui_id = userId;
    }

    const result = await prisma.thongBao.findFirst({
      where,
      include: {
        loai_tb: true,
        nguoi_gui: {
          select: userSelectFields
        },
        nguoi_nhan: {
          select: userSelectFields
        }
      }
    });
    return result as unknown as NotificationWithRelations | null;
  }

  async countUnread(userId: string): Promise<number> {
    return await prisma.thongBao.count({
      where: {
        nguoi_nhan_id: userId,
        da_doc: false
      }
    });
  }

  async markAsRead(notificationId: string): Promise<ThongBao> {
    return await prisma.thongBao.update({
      where: { id: notificationId },
      data: {
        da_doc: true,
        ngay_doc: new Date()
      }
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.thongBao.updateMany({
      where: {
        nguoi_nhan_id: userId,
        da_doc: false
      },
      data: {
        da_doc: true,
        ngay_doc: new Date()
      }
    });
    return { count: result.count };
  }

  async delete(notificationId: string): Promise<ThongBao> {
    return await prisma.thongBao.delete({
      where: { id: notificationId }
    });
  }

  async create(data: CreateNotificationData): Promise<ThongBao> {
    return await prisma.thongBao.create({
      data: data as Parameters<typeof prisma.thongBao.create>[0]['data'],
      include: {
        loai_tb: true,
        nguoi_gui: {
          select: userSelectFields
        },
        nguoi_nhan: {
          select: userSelectFields
        }
      }
    });
  }

  async createMany(dataArray: CreateNotificationData[]): Promise<{ count: number }> {
    return await prisma.thongBao.createMany({
      data: dataArray as Parameters<typeof prisma.thongBao.createMany>[0]['data']
    });
  }

  async findSentNotificationsBatch(
    userId: string,
    title: string,
    timestamp: Date,
    windowMs: number = 60000
  ): Promise<NotificationWithRelations[]> {
    const result = await prisma.thongBao.findMany({
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
          select: userSelectFields
        }
      }
    });
    return result as unknown as NotificationWithRelations[];
  }

  async findActivity(criteria: ActivityCriteria): Promise<HoatDong | null> {
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
    }) as unknown as HoatDong | null;
  }

  async getOrCreateNotificationType(
    loai_tb_id?: string,
    defaultName: string = 'Thông báo chung'
  ): Promise<LoaiThongBao> {
    if (loai_tb_id) {
      const found = await prisma.loaiThongBao.findUnique({
        where: { id: loai_tb_id }
      });
      if (found) return found;
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

  async getStudentClassIds(userId: string): Promise<string[]> {
    const student = await prisma.sinhVien.findFirst({
      where: { nguoi_dung_id: userId },
      select: { lop_id: true }
    });

    return student?.lop_id ? [student.lop_id] : [];
  }

  async getTeacherClassIds(userId: string): Promise<string[]> {
    const classes = await prisma.lop.findMany({
      where: { chu_nhiem: userId },
      select: { id: true }
    });

    return classes.map(c => c.id);
  }

  async getStudentsByClassIds(classIds: string[]): Promise<string[]> {
    const students = await prisma.sinhVien.findMany({
      where: { lop_id: { in: classIds } },
      select: { nguoi_dung_id: true }
    });

    return students.map(s => s.nguoi_dung_id).filter((id): id is string => !!id);
  }

  async getActivityParticipants(activityId: string): Promise<string[]> {
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
      .filter((id): id is string => Boolean(id));

    return Array.from(new Set(recipientIds));
  }

  async getSentStats(userId: string): Promise<{
    total: number;
    classScope: number;
    activityScope: number;
  }> {
    const allNotifications = await prisma.thongBao.findMany({
      where: { nguoi_gui_id: userId },
      select: {
        tieu_de: true,
        noi_dung: true,
        ngay_gui: true
      }
    });

    const grouped: Record<string, { scope: string }> = {};
    for (const notif of allNotifications) {
      const timestamp = notif.ngay_gui.getTime();
      const scopeMatch = notif.noi_dung.match(/phạm vi:\s*(class|activity|single)/i);
      const scope = scopeMatch ? scopeMatch[1].toLowerCase() : 'class';
      const key = `${notif.tieu_de}_${timestamp}_${scope}`;

      if (!grouped[key]) {
        grouped[key] = { scope };
      }
    }

    const uniqueNotifications = Object.values(grouped);
    const classCount = uniqueNotifications.filter(n => n.scope === 'class').length;
    const activityCount = uniqueNotifications.filter(n => n.scope === 'activity').length;

    return {
      total: uniqueNotifications.length,
      classScope: classCount,
      activityScope: activityCount
    };
  }
}

export default NotificationPrismaRepository;
module.exports = NotificationPrismaRepository;
