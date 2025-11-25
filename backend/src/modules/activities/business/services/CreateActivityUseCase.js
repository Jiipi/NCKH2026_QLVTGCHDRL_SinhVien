const CreateActivityDto = require('../dto/CreateActivityDto');
const { ValidationError } = require('../../../../core/errors/AppError');
const { determineSemesterFromDate } = require('../../../../core/utils/semester');
const crypto = require('crypto');
const { logInfo } = require('../../../../core/logger');

/**
 * CreateActivityUseCase
 * Use case for creating a new activity
 * Follows Single Responsibility Principle (SRP)
 */
class CreateActivityUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(dto, user) {
    // Normalize data
    const normalized = this.normalizeActivityData(dto.toDomain());

    // Validate dates
    this.validateDates(normalized);

    // Auto-infer semester if missing
    if (!normalized.hoc_ky || !normalized.nam_hoc) {
      const semesterInfo = determineSemesterFromDate(new Date(normalized.ngay_bd));
      normalized.hoc_ky = normalized.hoc_ky || `hoc_ky_${semesterInfo.semester === 1 ? '1' : '2'}`;
      normalized.nam_hoc = normalized.nam_hoc || String(semesterInfo.year);
    }

    // Generate QR token
    const qrToken = crypto.randomBytes(32).toString('hex');
    normalized.qr = qrToken;

    // Set creator
    normalized.nguoi_tao_id = user.sub;
    normalized.trang_thai = 'cho_duyet';

    // Create activity
    const activity = await this.activityRepository.create(normalized);

    logInfo('Activity created', {
      activityId: activity.id,
      creatorId: user.sub,
      name: activity.ten_hd
    });

    return activity;
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

module.exports = CreateActivityUseCase;

