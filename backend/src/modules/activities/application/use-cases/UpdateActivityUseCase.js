const { NotFoundError, ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');
const { canAccessItem } = require('../../../../app/scopes/scopeBuilder');

/**
 * UpdateActivityUseCase
 * Use case for updating an activity
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateActivityUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id, dto, user, scope) {
    // Check if activity exists in scope
    const existing = await this.activityRepository.findById(id, scope?.activityFilter || {});

    if (!existing) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    // Check ownership
    const canAccess = await canAccessItem('activities', id, user);
    if (!canAccess) {
      throw new ForbiddenError('Bạn không có quyền sửa hoạt động này');
    }

    // Normalize data
    const normalized = this.normalizeActivityData(dto.toDomain ? dto.toDomain() : dto);

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
    const updateData = {};
    if (normalized.ten_hd !== undefined) updateData.ten_hd = normalized.ten_hd;
    if (normalized.mo_ta !== undefined) updateData.mo_ta = normalized.mo_ta;
    if (normalized.loai_hd_id !== undefined) updateData.loai_hd_id = normalized.loai_hd_id;
    if (normalized.ngay_bd !== undefined) updateData.ngay_bd = normalized.ngay_bd;
    if (normalized.ngay_kt !== undefined) updateData.ngay_kt = normalized.ngay_kt;
    if (normalized.han_dk !== undefined) updateData.han_dk = normalized.han_dk;
    if (normalized.dia_diem !== undefined) updateData.dia_diem = normalized.dia_diem;
    if (normalized.sl_toi_da !== undefined) updateData.sl_toi_da = normalized.sl_toi_da;
    if (normalized.diem_rl !== undefined) updateData.diem_rl = normalized.diem_rl;
    if (normalized.hinh_anh !== undefined) updateData.hinh_anh = Array.isArray(normalized.hinh_anh) ? normalized.hinh_anh : [];
    if (normalized.tep_dinh_kem !== undefined) updateData.tep_dinh_kem = Array.isArray(normalized.tep_dinh_kem) ? normalized.tep_dinh_kem : [];
    if (normalized.hoc_ky !== undefined) updateData.hoc_ky = normalized.hoc_ky;
    if (normalized.nam_hoc !== undefined) updateData.nam_hoc = normalized.nam_hoc;

    return this.activityRepository.update(id, updateData);
  }

  normalizeActivityData(data) {
    return {
      ...data,
      hinh_anh: Array.isArray(data.hinh_anh) ? data.hinh_anh : [],
      tep_dinh_kem: Array.isArray(data.tep_dinh_kem) ? data.tep_dinh_kem : []
    };
  }

  validateDates(data) {
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

module.exports = UpdateActivityUseCase;

