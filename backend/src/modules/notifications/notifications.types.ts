/**
 * Notifications Module - Type Definitions
 * ThongBao entity types and DTOs
 */

import type { ThongBao, NguoiDung, LoaiThongBao } from '@prisma/client';

// ============== Entity Types ==============

/**
 * Core Notification entity
 */
export type Notification = ThongBao;

/**
 * Notification with relations
 */
export interface NotificationWithRelations extends ThongBao {
  loai_tb?: LoaiThongBao;
  nguoi_gui?: {
    id: number;
    ho_ten: string | null;
    email: string | null;
  };
  nguoi_nhan?: {
    id: number;
    ho_ten: string | null;
    email: string | null;
  };
}

// ============== Filter Types ==============

/**
 * Notification filter options
 */
export interface NotificationFilterOptions {
  nguoi_nhan_id?: number;
  nguoi_gui_id?: number;
  unread_only?: boolean | string;
  loai_tb_id?: number;
}

/**
 * Notification pagination options
 */
export interface NotificationPaginationOptions {
  page?: number;
  limit?: number;
}

// ============== DTO Types ==============

/**
 * Create Notification DTO
 */
export interface CreateNotificationDto {
  tieu_de: string;
  noi_dung: string;
  nguoi_nhan_id: number;
  loai_tb_id?: number;
}

/**
 * Notification Response DTO
 */
export interface NotificationDto {
  id: number;
  tieu_de: string;
  noi_dung: string;
  da_doc: boolean;
  ngay_gui: Date;
  loai_tb?: LoaiThongBao;
  sender?: {
    id: number;
    name: string | null;
    email: string | null;
  };
}

// ============== Result Types ==============

/**
 * Paginated notifications result
 */
export interface PaginatedNotificationsResult {
  notifications: NotificationWithRelations[];
  total: number;
}

/**
 * Unread count result
 */
export interface UnreadCountResult {
  count: number;
}

// ============== Repository Interface ==============

/**
 * Notification Repository Interface
 */
export interface INotificationRepository {
  findNotifications(filters: NotificationFilterOptions, pagination?: NotificationPaginationOptions): Promise<PaginatedNotificationsResult>;
  findById(notificationId: number): Promise<NotificationWithRelations | null>;
  createNotification(data: { tieu_de: string; noi_dung: string; nguoi_gui_id: number; nguoi_nhan_id: number; loai_tb_id?: number }): Promise<Notification>;
  markAsRead(notificationId: number): Promise<Notification>;
  markAllAsRead(userId: number): Promise<{ count: number }>;
  deleteNotification(notificationId: number): Promise<Notification>;
  countUnread(userId: number): Promise<number>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Notifications UseCase Interface
 */
export interface IGetNotificationsUseCase {
  execute(filters: NotificationFilterOptions, pagination?: NotificationPaginationOptions): Promise<{
    items: NotificationDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

/**
 * Create Notification UseCase Interface
 */
export interface ICreateNotificationUseCase {
  execute(data: CreateNotificationDto, senderId: number): Promise<NotificationDto>;
}

/**
 * Mark As Read UseCase Interface
 */
export interface IMarkAsReadUseCase {
  execute(notificationId: number, userId: number): Promise<NotificationDto>;
}

// ============== Controller Interface ==============

/**
 * Notifications Controller Interface
 */
export interface INotificationsController {
  getNotifications(req: unknown, res: unknown): Promise<void>;
  getNotificationById(req: unknown, res: unknown): Promise<void>;
  createNotification(req: unknown, res: unknown): Promise<void>;
  markAsRead(req: unknown, res: unknown): Promise<void>;
  markAllAsRead(req: unknown, res: unknown): Promise<void>;
  deleteNotification(req: unknown, res: unknown): Promise<void>;
  getUnreadCount(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
