const CreateActivityDto = require('../dto/CreateActivityDto');
const { ValidationError } = require('../../../../core/errors/AppError');
const { determineSemesterFromDate } = require('../../../../core/utils/semester');
const crypto = require('crypto');
const { logInfo } = require('../../../../core/logger');
const { prisma } = require('../../../../data/infrastructure/prisma/client');

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

    // Generate QR token (column length 32 chars -> use 16 bytes => 32 hex chars)
    const qrToken = crypto.randomBytes(16).toString('hex');
    normalized.qr = qrToken;

    // Set creator
    normalized.nguoi_tao_id = user.sub;
    normalized.trang_thai = 'cho_duyet';

    // Auto-assign lop_id dựa trên người tạo
    // Nếu LOP_TRUONG hoặc SINH_VIEN tạo -> gán lop_id = lớp của họ
    // Nếu GIANG_VIEN tạo -> gán lop_id = lớp đầu tiên họ chủ nhiệm (nếu có)
    if (!normalized.lop_id) {
      normalized.lop_id = await this.inferClassId(user);
    }

    // Create activity
    const activity = await this.activityRepository.create(normalized);

    logInfo('Activity created', {
      activityId: activity.id,
      creatorId: user.sub,
      name: activity.ten_hd,
      lop_id: activity.lop_id
    });

    return activity;
  }

  /**
   * Tự động xác định lop_id dựa trên người tạo
   */
  async inferClassId(user) {
    const userId = user.sub;
    const role = user.role;

    // LOP_TRUONG hoặc SINH_VIEN: lấy lop_id từ bảng SinhVien
    if (role === 'LOP_TRUONG' || role === 'SINH_VIEN') {
      const sv = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: userId },
        select: { lop_id: true }
      });
      return sv?.lop_id || null;
    }

    // GIANG_VIEN: lấy lớp đầu tiên họ chủ nhiệm
    if (role === 'GIANG_VIEN') {
      const lop = await prisma.lop.findFirst({
        where: { chu_nhiem: userId },
        select: { id: true }
      });
      return lop?.id || null;
    }

    // ADMIN: không tự động gán
    return null;
  }

  normalizeActivityData(data) {
    const toDateOrNull = (value, fieldName) => {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new ValidationError(`Giá trị ${fieldName} không hợp lệ`);
      }
      return date;
    };

    const normalized = {
      ...data,
      ten_hd: (data.ten_hd || '').trim(),
      ngay_bd: toDateOrNull(data.ngay_bd, 'ngày bắt đầu'),
      ngay_kt: toDateOrNull(data.ngay_kt, 'ngày kết thúc'),
      han_dk: toDateOrNull(data.han_dk, 'hạn đăng ký'),
      hinh_anh: Array.isArray(data.hinh_anh) ? data.hinh_anh : [],
      tep_dinh_kem: Array.isArray(data.tep_dinh_kem) ? data.tep_dinh_kem : []
    };

    if (!normalized.ten_hd) {
      throw new ValidationError('Vui lòng nhập tên hoạt động');
    }

    if (!normalized.loai_hd_id) {
      throw new ValidationError('Vui lòng chọn loại hoạt động');
    }

    if (!normalized.ngay_bd || !normalized.ngay_kt) {
      throw new ValidationError('Vui lòng chọn đầy đủ thời gian bắt đầu/kết thúc');
    }

    const diem = Number(normalized.diem_rl);
    normalized.diem_rl = Number.isFinite(diem) && diem >= 0 ? diem : 0;

    if (normalized.sl_toi_da === null || normalized.sl_toi_da === undefined || normalized.sl_toi_da === '') {
      delete normalized.sl_toi_da; // để Prisma dùng default
    } else {
      const limit = parseInt(normalized.sl_toi_da, 10);
      if (!Number.isFinite(limit) || limit < 1) {
        throw new ValidationError('Số lượng tối đa phải lớn hơn 0');
      }
      normalized.sl_toi_da = limit;
    }

    return normalized;
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

