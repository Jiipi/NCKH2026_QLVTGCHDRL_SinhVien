import type { ThongBao, LoaiThongBao, HoatDong } from '@prisma/client';

type Priority = 'thap' | 'trung_binh' | 'cao' | 'khan_cap';
type SendMethod = 'trong_he_thong' | 'email' | 'sdt';

export interface NotificationFilters {
  nguoi_nhan_id?: string;
  nguoi_gui_id?: string;
  da_doc?: boolean;
  loai_tb_id?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface CreateNotificationData {
  tieu_de: string;
  noi_dung: string;
  loai_tb_id: string;
  nguoi_gui_id: string;
  nguoi_nhan_id: string;
  muc_do_uu_tien: Priority;
  phuong_thuc_gui: SendMethod;
}

export interface ActivityCriteria {
  id?: string;
  ma_hd?: string;
}

export interface NotificationWithRelations extends ThongBao {
  loai_tb: LoaiThongBao;
  nguoi_gui: { ho_ten: string | null; email: string };
  nguoi_nhan: { ho_ten: string | null; email: string };
}

/**
 * INotificationRepository
 * Interface for notification data access
 * Follows Dependency Inversion Principle (DIP)
 */
abstract class INotificationRepository {
  abstract findNotifications(
    filters: NotificationFilters,
    pagination: PaginationOptions
  ): Promise<{ data: NotificationWithRelations[]; total: number }>;

  abstract findById(notificationId: string): Promise<NotificationWithRelations | null>;

  abstract findByIdForUser(
    notificationId: string,
    userId: string,
    type: 'sent' | 'received'
  ): Promise<NotificationWithRelations | null>;

  abstract countUnread(userId: string): Promise<number>;

  abstract markAsRead(notificationId: string): Promise<ThongBao>;

  abstract markAllAsRead(userId: string): Promise<{ count: number }>;

  abstract delete(notificationId: string): Promise<ThongBao>;

  abstract create(data: CreateNotificationData): Promise<ThongBao>;

  abstract createMany(dataArray: CreateNotificationData[]): Promise<{ count: number }>;

  abstract findSentNotificationsBatch(
    userId: string,
    title: string,
    timestamp: Date,
    windowMs?: number
  ): Promise<NotificationWithRelations[]>;

  abstract findActivity(criteria: ActivityCriteria): Promise<HoatDong | null>;

  abstract getOrCreateNotificationType(
    loai_tb_id?: string,
    defaultName?: string
  ): Promise<LoaiThongBao>;

  abstract getStudentClassIds(userId: string): Promise<string[]>;

  abstract getTeacherClassIds(userId: string): Promise<string[]>;

  abstract getStudentsByClassIds(classIds: string[]): Promise<string[]>;

  abstract getActivityParticipants(activityId: string): Promise<string[]>;

  abstract getSentStats(userId: string): Promise<{
    total: number;
    classScope: number;
    activityScope: number;
  }>;
}

export default INotificationRepository;
module.exports = INotificationRepository;
