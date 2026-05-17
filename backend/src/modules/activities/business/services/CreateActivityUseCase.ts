import type { HoatDong, Prisma } from '@prisma/client';
import type IActivityRepository from '../interfaces/IActivityRepository';
import { ValidationError } from '../../../../core/errors/AppError';
import { determineSemesterFromDate } from '../../../../core/utils/semester';
import { normalizeRoleName } from '../../../../core/utils/roleHelper';
import crypto from 'crypto';
import { logInfo } from '../../../../core/logger';

interface User {
  sub: string;
  role: string;
}

interface CreateActivityInput {
  ten_hd?: string;
  loai_hd_id?: string;
  ngay_bd?: Date | string;
  ngay_kt?: Date | string;
  han_dk?: Date | string;
  hoc_ky?: string;
  nam_hoc?: string;
  lop_id?: string | null;
  diem_rl?: number;
  sl_toi_da?: number | string | null;
  hinh_anh?: string[];
  tep_dinh_kem?: string[];
  [key: string]: unknown;
}

interface NormalizedActivityData extends CreateActivityInput {
  ten_hd: string;
  ngay_bd: Date | null;
  ngay_kt: Date | null;
  han_dk: Date | null;
  qr?: string;
  nguoi_tao_id?: string;
  trang_thai?: string;
}

interface CreateActivityDtoInstance {
  toDomain(): unknown;
}

const VIETNAM_UTC_OFFSET_HOURS = 7;
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;

const parseActivityDate = (value: Date | string): Date => {
  if (value instanceof Date) return value;
  if (DATETIME_LOCAL_PATTERN.test(value)) {
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second = 0] = timePart.split(':').map(Number);
    return new Date(Date.UTC(year, month - 1, day, hour - VIETNAM_UTC_OFFSET_HOURS, minute, second));
  }
  return new Date(value);
};

/**
 * CreateActivityUseCase
 * Use case for creating a new activity
 * Follows Single Responsibility Principle (SRP)
 */
class CreateActivityUseCase {
  private activityRepository: IActivityRepository;

  constructor(activityRepository: IActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(dto: CreateActivityDtoInstance, user: User): Promise<HoatDong> {
    // Normalize data
    const normalized = this.normalizeActivityData(dto.toDomain() as CreateActivityInput);

    // Validate dates
    this.validateDates(normalized);

    // Auto-infer semester if missing
    if (!normalized.hoc_ky || !normalized.nam_hoc) {
      const semesterInfo = determineSemesterFromDate(new Date(normalized.ngay_bd!));
      normalized.hoc_ky = normalized.hoc_ky || `hoc_ky_${Number(semesterInfo.semester) === 1 ? '1' : '2'}`;
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
    const activity = await this.activityRepository.create(normalized as unknown as Prisma.HoatDongCreateInput);

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
  private async inferClassId(user: User): Promise<string | null> {
    const userId = user.sub;
    const role = normalizeRoleName(user.role);

    // LOP_TRUONG hoặc SINH_VIEN: lấy lop_id từ bảng SinhVien
    if (role === 'LOP_TRUONG' || role === 'SINH_VIEN') {
      const sv = await this.activityRepository.findStudentByUserId(userId);
      return sv?.lop_id || null;
    }

    // GIANG_VIEN: lấy lớp đầu tiên họ chủ nhiệm
    if (role === 'GIANG_VIEN') {
      const lop = await this.activityRepository.findFirstClassByTeacherId(userId);
      return lop?.id || null;
    }

    // ADMIN: không tự động gán
    return null;
  }

  private normalizeActivityData(data: CreateActivityInput): NormalizedActivityData {
    const toDateOrNull = (value: Date | string | null | undefined, fieldName: string): Date | null => {
      if (!value) return null;
      const date = parseActivityDate(value);
      if (Number.isNaN(date.getTime())) {
        throw new ValidationError(`Giá trị ${fieldName} không hợp lệ`);
      }
      return date;
    };

    const normalized: NormalizedActivityData = {
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
      const limit = parseInt(String(normalized.sl_toi_da), 10);
      if (!Number.isFinite(limit) || limit < 1) {
        throw new ValidationError('Số lượng tối đa phải lớn hơn 0');
      }
      normalized.sl_toi_da = limit;
    }

    return normalized;
  }

  private validateDates(data: NormalizedActivityData): void {
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

export default CreateActivityUseCase;
