import type { LoaiHoatDong } from '@prisma/client';
import type { CreateActivityTypeInput } from '../dto/CreateActivityTypeDto';

/**
 * Query parameters for findAll
 */
export interface FindAllParams {
  skip: number;
  take: number;
  search?: string;
}

/**
 * Update data for activity type
 */
export interface UpdateActivityTypeData {
  ten_loai_hd?: string;
  mo_ta?: string | null;
  diem_mac_dinh?: number;
  diem_toi_da?: number;
  mau_sac?: string | null;
  hinh_anh?: string | null;
}

/**
 * IActivityTypeRepository
 * Interface for activity type data access
 * Follows Dependency Inversion Principle (DIP)
 */
abstract class IActivityTypeRepository {
  abstract findAll(params: FindAllParams): Promise<LoaiHoatDong[]>;

  abstract count(search?: string): Promise<number>;

  abstract findById(id: string): Promise<LoaiHoatDong | null>;

  abstract findByName(name: string): Promise<LoaiHoatDong | null>;

  abstract create(data: CreateActivityTypeInput): Promise<LoaiHoatDong>;

  abstract update(id: string, data: UpdateActivityTypeData): Promise<LoaiHoatDong>;

  abstract delete(id: string): Promise<LoaiHoatDong>;
}

export default IActivityTypeRepository;
module.exports = IActivityTypeRepository;
