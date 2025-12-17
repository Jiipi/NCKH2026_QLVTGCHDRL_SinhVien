/**
 * Activity Types Module - Type Definitions
 * LoaiHoatDong entity types and DTOs
 */

import type { LoaiHoatDong } from '@prisma/client';

// ============== Entity Types ==============

/**
 * Core Activity Type entity
 */
export type ActivityType = LoaiHoatDong;

/**
 * Activity Type with activity count
 */
export interface ActivityTypeWithCount extends LoaiHoatDong {
  _count?: {
    hoat_dongs?: number;
  };
  activityCount?: number;
}

// ============== DTO Types ==============

/**
 * Create Activity Type DTO
 */
export interface CreateActivityTypeDto {
  ten_loai_hd: string;
  mo_ta?: string | null;
  diem_mac_dinh?: number;
  diem_toi_da?: number;
  mau_sac?: string | null;
  hinh_anh?: string | null;
}

/**
 * Update Activity Type DTO
 */
export interface UpdateActivityTypeDto {
  ten_loai_hd?: string;
  mo_ta?: string | null;
  diem_mac_dinh?: number;
  diem_toi_da?: number;
  mau_sac?: string | null;
  hinh_anh?: string | null;
}

/**
 * Activity Type Response DTO
 */
export interface ActivityTypeDto {
  id: string;
  ten_loai_hd: string;
  mo_ta: string | null;
  diem_mac_dinh: number;
  diem_toi_da: number;
  mau_sac: string | null;
  hinh_anh: string | null;
  activityCount?: number;
}

// ============== Query Types ==============

/**
 * Activity Type query options
 */
export interface ActivityTypeQueryOptions {
  skip?: number;
  take?: number;
  search?: string;
}

/**
 * Paginated activity types result
 */
export interface PaginatedActivityTypesResult {
  items: ActivityType[];
  total: number;
}

// ============== Repository Interface ==============

/**
 * Activity Types Repository Interface
 */
export interface IActivityTypesRepository {
  findAll(options: ActivityTypeQueryOptions): Promise<ActivityType[]>;
  count(search?: string): Promise<number>;
  findById(id: string): Promise<ActivityType | null>;
  findByName(name: string): Promise<ActivityType | null>;
  create(data: CreateActivityTypeDto): Promise<ActivityType>;
  update(id: string, data: UpdateActivityTypeDto): Promise<ActivityType>;
  delete(id: string): Promise<ActivityType>;
  countActivitiesUsingType(typeId: string): Promise<number>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Activity Types UseCase Interface
 */
export interface IGetActivityTypesUseCase {
  execute(options: ActivityTypeQueryOptions): Promise<{
    items: ActivityTypeDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

/**
 * Get Activity Type By Id UseCase Interface
 */
export interface IGetActivityTypeByIdUseCase {
  execute(id: string): Promise<ActivityTypeDto>;
}

/**
 * Create Activity Type UseCase Interface
 */
export interface ICreateActivityTypeUseCase {
  execute(data: CreateActivityTypeDto): Promise<ActivityTypeDto>;
}

/**
 * Update Activity Type UseCase Interface
 */
export interface IUpdateActivityTypeUseCase {
  execute(id: string, data: UpdateActivityTypeDto): Promise<ActivityTypeDto>;
}

/**
 * Delete Activity Type UseCase Interface
 */
export interface IDeleteActivityTypeUseCase {
  execute(id: string): Promise<{ message: string }>;
}

// ============== Controller Interface ==============

/**
 * Activity Types Controller Interface
 */
export interface IActivityTypesController {
  getActivityTypes(req: unknown, res: unknown): Promise<void>;
  getActivityTypeById(req: unknown, res: unknown): Promise<void>;
  createActivityType(req: unknown, res: unknown): Promise<void>;
  updateActivityType(req: unknown, res: unknown): Promise<void>;
  deleteActivityType(req: unknown, res: unknown): Promise<void>;
  uploadImage?(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
