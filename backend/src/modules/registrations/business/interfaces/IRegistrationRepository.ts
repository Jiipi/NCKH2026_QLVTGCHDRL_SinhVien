/**
 * IRegistrationRepository Interface
 * Contract for registration data access
 * Follows Dependency Inversion Principle (DIP)
 */

import type { DangKyHoatDong } from '@prisma/client';
import type { RegistrationStatusVN, RegistrationStatusEN } from '../../registrations.types';

/**
 * Include options for repository queries
 */
export interface RegistrationIncludeOptions {
  activity?: boolean;
  user?: boolean;
  approvedBy?: boolean;
}

/**
 * Filter options for finding registrations by user
 */
export interface UserRegistrationFilters {
  status?: RegistrationStatusEN | RegistrationStatusVN | string;
}

/**
 * Query parameters for findMany
 */
export interface FindManyParams {
  where?: Record<string, unknown>;
  skip?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: RegistrationIncludeOptions;
}

/**
 * Result type for findMany
 */
export interface FindManyResult<T> {
  items: T[];
  total: number;
}

/**
 * Create registration data
 */
export interface CreateRegistrationData {
  userId?: string;
  sv_id?: string;
  activityId?: string;
  hd_id?: string;
  trang_thai_dk?: RegistrationStatusVN;
  status?: RegistrationStatusEN;
  note?: string;
  ly_do?: string;
  ghi_chu?: string;
  ngay_dang_ky?: Date;
}

/**
 * Update registration data
 */
export interface UpdateRegistrationData {
  status?: RegistrationStatusEN | RegistrationStatusVN | string;
  trang_thai_dk?: RegistrationStatusVN;
  ly_do?: string;
  ly_do_tu_choi?: string;
  ngay_duyet?: Date;
  ngay_tham_gia?: Date;
  nguoi_duyet_id?: string;
  note?: string;
}

/**
 * Activity statistics
 */
export interface ActivityStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  attended: number;
}

/**
 * Bulk update result
 */
export interface BulkUpdateResult {
  count: number;
}

/**
 * IRegistrationRepository Interface
 */
export interface IRegistrationRepository {
  findMany<T = unknown>(params: FindManyParams): Promise<FindManyResult<T>>;
  findById<T = unknown>(id: string, include?: RegistrationIncludeOptions): Promise<T | null>;
  findByUserAndActivity(userId: string, activityId: string): Promise<DangKyHoatDong | null>;
  create<T = unknown>(data: CreateRegistrationData): Promise<T>;
  update<T = unknown>(id: string, data: UpdateRegistrationData): Promise<T>;
  delete(id: string): Promise<DangKyHoatDong>;
  bulkApprove(ids: string[], approverId?: string): Promise<BulkUpdateResult>;
  bulkReject(ids: string[], reason?: string, approverId?: string): Promise<BulkUpdateResult>;
  checkIn<T = unknown>(id: string, checkInTime?: Date): Promise<T>;
  findByUser(userId: string, filters?: UserRegistrationFilters): Promise<DangKyHoatDong[]>;
  getActivityStats(activityId: string): Promise<ActivityStats>;
}

/**
 * Abstract class for IRegistrationRepository
 * Provides default implementations that throw errors
 */
export abstract class BaseRegistrationRepository implements IRegistrationRepository {
  async findMany<T = unknown>(_params: FindManyParams): Promise<FindManyResult<T>> {
    throw new Error('Must implement findMany()');
  }

  async findById<T = unknown>(_id: string, _include?: RegistrationIncludeOptions): Promise<T | null> {
    throw new Error('Must implement findById()');
  }

  async findByUserAndActivity(_userId: string, _activityId: string): Promise<DangKyHoatDong | null> {
    throw new Error('Must implement findByUserAndActivity()');
  }

  async create<T = unknown>(_data: CreateRegistrationData): Promise<T> {
    throw new Error('Must implement create()');
  }

  async update<T = unknown>(_id: string, _data: UpdateRegistrationData): Promise<T> {
    throw new Error('Must implement update()');
  }

  async delete(_id: string): Promise<DangKyHoatDong> {
    throw new Error('Must implement delete()');
  }

  async bulkApprove(_ids: string[], _approverId?: string): Promise<BulkUpdateResult> {
    throw new Error('Must implement bulkApprove()');
  }

  async bulkReject(_ids: string[], _reason?: string, _approverId?: string): Promise<BulkUpdateResult> {
    throw new Error('Must implement bulkReject()');
  }

  async checkIn<T = unknown>(_id: string, _checkInTime?: Date): Promise<T> {
    throw new Error('Must implement checkIn()');
  }

  async findByUser(_userId: string, _filters?: UserRegistrationFilters): Promise<DangKyHoatDong[]> {
    throw new Error('Must implement findByUser()');
  }

  async getActivityStats(_activityId: string): Promise<ActivityStats> {
    throw new Error('Must implement getActivityStats()');
  }
}

export default IRegistrationRepository;
