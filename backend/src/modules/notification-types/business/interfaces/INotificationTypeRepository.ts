import type { LoaiThongBao } from '@prisma/client';

/**
 * INotificationTypeRepository
 * Interface for notification type data access
 * Follows Dependency Inversion Principle (DIP)
 */

export interface NotificationTypeOrderBy {
  ten_loai_tb?: 'asc' | 'desc';
  created_at?: 'asc' | 'desc';
}

export interface NotificationTypeWithCount extends LoaiThongBao {
  _count?: {
    thong_baos: number;
  };
}

export interface CreateNotificationTypeData {
  ten_loai_tb: string;
  mo_ta?: string | null;
}

export interface UpdateNotificationTypeData {
  ten_loai_tb: string;
  mo_ta?: string | null;
}

abstract class INotificationTypeRepository {
  abstract findAll(orderBy?: NotificationTypeOrderBy): Promise<NotificationTypeWithCount[]>;

  abstract findById(id: string): Promise<NotificationTypeWithCount | null>;

  abstract findByName(name: string, excludeId?: string | null): Promise<LoaiThongBao | null>;

  abstract create(data: CreateNotificationTypeData): Promise<LoaiThongBao>;

  abstract update(id: string, data: UpdateNotificationTypeData): Promise<LoaiThongBao>;

  abstract delete(id: string): Promise<LoaiThongBao>;

  abstract countNotificationsUsingType(typeId: string): Promise<number>;
}

export default INotificationTypeRepository;
module.exports = INotificationTypeRepository;
