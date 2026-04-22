import type { HoatDong, Prisma } from '@prisma/client';
import type IActivityRepository from '../interfaces/IActivityRepository';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../../core/errors/AppError';
import { canAccessItem } from '../../../../app/scopes/scopeBuilder';

/**
 * User type for authorization
 */
interface User {
  sub: string;
  role: string;
  [key: string]: unknown;
}

/**
 * Scope type with activity filter
 */
interface Scope {
  activityFilter?: Prisma.HoatDongWhereInput;
  [key: string]: unknown;
}

/**
 * DTO with toDomain method
 */
interface UpdateActivityDtoType {
  ten_hd?: string;
  mo_ta?: string;
  loai_hd_id?: string;
  ngay_bd?: string | Date;
  ngay_kt?: string | Date;
  han_dk?: string | Date;
  sl_toi_da?: number | string;
  diem_rl?: number | string;
  dia_diem?: string;
  hoc_ky?: string;
  nam_hoc?: string | null;
  hinh_anh?: string[];
  tep_dinh_kem?: string[];
  nguoi_tao_id?: string;
  toDomain?: () => NormalizedActivityData;
}

/**
 * Normalized activity data for update
 */
interface NormalizedActivityData {
  ten_hd?: string;
  mo_ta?: string;
  loai_hd_id?: string;
  ngay_bd?: Date | string;
  ngay_kt?: Date | string;
  han_dk?: Date | string;
  sl_toi_da?: number;
  diem_rl?: number;
  dia_diem?: string;
  hoc_ky?: string;
  nam_hoc?: string;
  hinh_anh?: string[];
  tep_dinh_kem?: string[];
  nguoi_tao_id?: string;
}

/**
 * Date validation data
 */
interface DateValidationData {
  ngay_bd?: Date | string;
  ngay_kt?: Date | string;
  han_dk?: Date | string;
}

/**
 * UpdateActivityUseCase
 * Use case for updating an activity
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateActivityUseCase {
  private activityRepository: IActivityRepository;

  constructor(activityRepository: IActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(
    id: string,
    dto: UpdateActivityDtoType,
    user: User,
    scope?: Scope,
    semesterInfo?: { hoc_ky: string; nam_hoc: string }
  ): Promise<HoatDong> {
    // Check if activity exists in scope and validate semester
    const existing = await this.activityRepository.findById(id, scope?.activityFilter || {}, null, semesterInfo);

    if (!existing) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    // Check ownership
    const canAccess = await canAccessItem('activities', id, user);
    if (!canAccess) {
      throw new ForbiddenError('Bạn không có quyền sửa hoạt động này');
    }

    // Normalize data
    const normalized = this.normalizeActivityData(dto.toDomain ? dto.toDomain() : dto as NormalizedActivityData);

    // Validate dates if provided
    if (normalized.ngay_bd || normalized.ngay_kt || normalized.han_dk) {
      this.validateDates({
        ngay_bd: normalized.ngay_bd || existing.ngay_bd,
        ngay_kt: normalized.ngay_kt || existing.ngay_kt,
        han_dk: normalized.han_dk || existing.han_dk
      });
    }

    // Don't allow changing creator
    delete normalized.nguoi_tao_id;

    // Whitelist fields allowed to update
    const updateData: Prisma.HoatDongUpdateInput = {};
    if (normalized.ten_hd !== undefined) updateData.ten_hd = normalized.ten_hd;
    if (normalized.mo_ta !== undefined) updateData.mo_ta = normalized.mo_ta;
    if (normalized.loai_hd_id !== undefined) updateData.loai_hd = { connect: { id: normalized.loai_hd_id } };
    if (normalized.ngay_bd !== undefined) updateData.ngay_bd = normalized.ngay_bd;
    if (normalized.ngay_kt !== undefined) updateData.ngay_kt = normalized.ngay_kt;
    if (normalized.han_dk !== undefined) updateData.han_dk = normalized.han_dk;
    if (normalized.dia_diem !== undefined) updateData.dia_diem = normalized.dia_diem;
    if (normalized.sl_toi_da !== undefined) updateData.sl_toi_da = normalized.sl_toi_da;
    if (normalized.diem_rl !== undefined) updateData.diem_rl = normalized.diem_rl;
    if (normalized.hinh_anh !== undefined) updateData.hinh_anh = Array.isArray(normalized.hinh_anh) ? normalized.hinh_anh : [];
    if (normalized.tep_dinh_kem !== undefined) updateData.tep_dinh_kem = Array.isArray(normalized.tep_dinh_kem) ? normalized.tep_dinh_kem : [];
    if (normalized.hoc_ky !== undefined) updateData.hoc_ky = normalized.hoc_ky as Prisma.EnumHocKyFieldUpdateOperationsInput['set'];
    if (normalized.nam_hoc !== undefined) updateData.nam_hoc = normalized.nam_hoc;

    return this.activityRepository.update(id, updateData);
  }

  normalizeActivityData(data: NormalizedActivityData): NormalizedActivityData {
    return {
      ...data,
      hinh_anh: Array.isArray(data.hinh_anh) ? data.hinh_anh : [],
      tep_dinh_kem: Array.isArray(data.tep_dinh_kem) ? data.tep_dinh_kem : []
    };
  }

  validateDates(data: DateValidationData): void {
    if (data.ngay_bd && data.ngay_kt) {
      const startDate = new Date(data.ngay_bd);
      const endDate = new Date(data.ngay_kt);

      if (endDate < startDate) {
        throw new ValidationError('Ngày kết thúc phải sau ngày bắt đầu');
      }
    }

    if (data.han_dk && data.ngay_bd) {
      const deadline = new Date(data.han_dk);
      const startDate = new Date(data.ngay_bd);

      if (deadline > startDate) {
        throw new ValidationError('Hạn đăng ký phải trước ngày bắt đầu');
      }
    }
  }
}

export default UpdateActivityUseCase;
