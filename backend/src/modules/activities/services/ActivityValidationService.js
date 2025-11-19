/**
 * Activity Validation Service
 * Handles validation and normalization of activity data
 * Follows Single Responsibility Principle (SRP)
 */

const { ValidationError } = require('../../../core/errors/AppError');

class ActivityValidationService {
  /**
   * Map incoming request fields to Prisma model fields
   */
  mapIncomingFields(data) {
    const src = data || {};
    const mapped = {};

    // Name fields (support both legacy and new keys)
    mapped.ten_hd = src.ten_hd ?? src.ten_hoat_dong ?? '';
    mapped.mo_ta = src.mo_ta ?? null;

    // Activity type (UUID string expected by Prisma schema)
    mapped.loai_hd_id = src.loai_hd_id ?? src.loai_hoat_dong_id ?? null;

    // Dates
    mapped.ngay_bd = src.ngay_bd ?? src.ngay_bat_dau ?? null;
    mapped.ngay_kt = src.ngay_kt ?? src.ngay_ket_thuc ?? null;
    mapped.han_dk = src.han_dk ?? null;

    // Optional fields with normalization
    const toNumberOrNull = (v) => {
      if (v === undefined || v === null || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    mapped.sl_toi_da = toNumberOrNull(src.sl_toi_da ?? src.so_luong_toi_da);
    mapped.diem_rl = toNumberOrNull(src.diem_rl ?? src.diem_ren_luyen);
    mapped.dia_diem = src.dia_diem ?? null;

    // Semester fields (may be filled later if missing)
    mapped.hoc_ky = src.hoc_ky ?? null;
    mapped.nam_hoc = src.nam_hoc ?? null;

    return mapped;
  }

  /**
   * Normalize activity data
   */
  normalizeActivityData(data) {
    const normalized = { ...data };

    // Normalize arrays
    if (normalized.hinh_anh) {
      normalized.hinh_anh = this.normalizeFileArray(normalized.hinh_anh);
    }
    if (normalized.tep_dinh_kem) {
      normalized.tep_dinh_kem = this.normalizeFileArray(normalized.tep_dinh_kem);
    }

    // Convert dates
    if (normalized.ngay_bd) normalized.ngay_bd = new Date(normalized.ngay_bd);
    if (normalized.ngay_kt) normalized.ngay_kt = new Date(normalized.ngay_kt);
    if (normalized.han_dk) normalized.han_dk = new Date(normalized.han_dk);

    return normalized;
  }

  /**
   * Normalize file array (handle URLs)
   */
  normalizeFileArray(value) {
    if (!Array.isArray(value)) return [];

    const seen = new Set();
    const result = [];

    for (const item of value) {
      let url = null;

      if (typeof item === 'string') {
        url = item;
      } else if (item && typeof item === 'object') {
        url = item.url || item.src || item.path;
      }

      if (url && typeof url === 'string') {
        // Normalize to /uploads/... format
        const idx = url.indexOf('/uploads/');
        const normalized = idx >= 0 ? url.slice(idx) : url;

        if (normalized && !seen.has(normalized)) {
          seen.add(normalized);
          result.push(normalized);
        }
      }
    }

    return result;
  }

  /**
   * Validate activity dates
   */
  validateDates(data) {
    const { ngay_bd, ngay_kt, han_dk } = data;

    if (ngay_bd && ngay_kt && new Date(ngay_bd) >= new Date(ngay_kt)) {
      throw new ValidationError('Ngày kết thúc phải sau ngày bắt đầu');
    }

    if (ngay_bd && han_dk && new Date(han_dk) >= new Date(ngay_bd)) {
      throw new ValidationError('Hạn đăng ký phải trước ngày bắt đầu');
    }
  }
}

module.exports = ActivityValidationService;

