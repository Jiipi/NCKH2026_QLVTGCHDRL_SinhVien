/**
 * Notification Types Module - Type Definitions
 * LoaiThongBao entity types and DTOs
 */

import type { LoaiThongBao } from '@prisma/client';

// ============== Entity Types ==============

/**
 * Core Notification Type entity
 */
export type NotificationType = LoaiThongBao;

/**
 * Notification Type with count
 */
export interface NotificationTypeWithCount extends LoaiThongBao {
  _count?: {
    thong_baos?: number;
  };
  notificationCount?: number;
}

// ============== DTO Types ==============

/**
 * Create Notification Type DTO
 */
export interface CreateNotificationTypeDto {
  ten_loai_tb: string;
  mo_ta?: string | null;
}

/**
 * Update Notification Type DTO
 */
export interface UpdateNotificationTypeDto {
  ten_loai_tb?: string;
  mo_ta?: string | null;
}

/**
 * Notification Type Response DTO
 */
export interface NotificationTypeDto {
  id: number;
  ten_loai_tb: string;
  mo_ta: string | null;
  notificationCount?: number;
}

// ============== Repository Interface ==============

/**
 * Notification Types Repository Interface
 */
export interface INotificationTypesRepository {
  findAll(orderBy?: Record<string, 'asc' | 'desc'>): Promise<NotificationTypeWithCount[]>;
  findById(id: number): Promise<NotificationTypeWithCount | null>;
  findByName(name: string, excludeId?: number): Promise<NotificationType | null>;
  create(data: CreateNotificationTypeDto): Promise<NotificationType>;
  update(id: number, data: UpdateNotificationTypeDto): Promise<NotificationType>;
  delete(id: number): Promise<NotificationType>;
  countNotificationsUsingType(typeId: number): Promise<number>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Notification Types UseCase Interface
 */
export interface IGetNotificationTypesUseCase {
  execute(): Promise<NotificationTypeDto[]>;
}

/**
 * Get Notification Type By Id UseCase Interface
 */
export interface IGetNotificationTypeByIdUseCase {
  execute(id: number): Promise<NotificationTypeDto>;
}

/**
 * Create Notification Type UseCase Interface
 */
export interface ICreateNotificationTypeUseCase {
  execute(data: CreateNotificationTypeDto): Promise<NotificationTypeDto>;
}

/**
 * Update Notification Type UseCase Interface
 */
export interface IUpdateNotificationTypeUseCase {
  execute(id: number, data: UpdateNotificationTypeDto): Promise<NotificationTypeDto>;
}

/**
 * Delete Notification Type UseCase Interface
 */
export interface IDeleteNotificationTypeUseCase {
  execute(id: number): Promise<{ message: string }>;
}

// ============== Controller Interface ==============

/**
 * Notification Types Controller Interface
 */
export interface INotificationTypesController {
  getNotificationTypes(req: unknown, res: unknown): Promise<void>;
  getNotificationTypeById(req: unknown, res: unknown): Promise<void>;
  createNotificationType(req: unknown, res: unknown): Promise<void>;
  updateNotificationType(req: unknown, res: unknown): Promise<void>;
  deleteNotificationType(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
