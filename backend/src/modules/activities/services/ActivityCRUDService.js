/**
 * Activity CRUD Service
 * Handles create, update, delete operations for activities
 * Follows Single Responsibility Principle (SRP)
 */

const activitiesRepo = require('../activities.repo');
const { buildScope, canAccessItem } = require('../../../app/scopes/scopeBuilder');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../../core/errors/AppError');
const { determineSemesterFromDate } = require('../../../core/utils/semester');
const ActivityValidationService = require('./ActivityValidationService');
const ActivityQRService = require('./ActivityQRService');

class ActivityCRUDService {
  constructor() {
    this.validationService = new ActivityValidationService();
    this.qrService = new ActivityQRService();
  }

  /**
   * Create new activity
   */
  async create(data, user) {
    // Map incoming to model fields then normalize
    const normalized = this.validationService.normalizeActivityData(
      this.validationService.mapIncomingFields(data)
    );

    // Validate dates
    this.validationService.validateDates(normalized);

    // Auto-infer semester if missing (requires valid start date)
    if (!normalized.hoc_ky || !normalized.nam_hoc) {
      const semesterInfo = determineSemesterFromDate(new Date(normalized.ngay_bd));
      normalized.hoc_ky = normalized.hoc_ky || `hoc_ky_${semesterInfo.semester === 1 ? '1' : '2'}`;
      normalized.nam_hoc = normalized.nam_hoc || String(semesterInfo.year); // Use single year format
    }

    // Set creator
    normalized.nguoi_tao_id = user.sub;

    // Set initial status based on role (V1 compat logic)
    // GIANG_VIEN and ADMIN activities are auto-approved
    // LOP_TRUONG activities need approval
    const role = String(user.role || '').toUpperCase();
    normalized.trang_thai = normalized.trang_thai || 
      (role === 'GIANG_VIEN' || role === 'ADMIN' ? 'da_duyet' : 'cho_duyet');

    // Generate QR token (field name is 'qr' in Prisma schema)
    normalized.qr = this.qrService.generateQRToken();

    // Whitelist only Prisma model fields for create
    const createData = {
      ten_hd: normalized.ten_hd,
      mo_ta: normalized.mo_ta ?? null,
      loai_hd_id: normalized.loai_hd_id,
      diem_rl: normalized.diem_rl ?? 0,
      dia_diem: normalized.dia_diem ?? null,
      ngay_bd: normalized.ngay_bd,
      ngay_kt: normalized.ngay_kt,
      han_dk: normalized.han_dk ?? null,
      sl_toi_da: normalized.sl_toi_da ?? 1,
      trang_thai: normalized.trang_thai,
      qr: normalized.qr,
      hinh_anh: Array.isArray(normalized.hinh_anh) ? normalized.hinh_anh : [],
      tep_dinh_kem: Array.isArray(normalized.tep_dinh_kem) ? normalized.tep_dinh_kem : [],
      nguoi_tao_id: normalized.nguoi_tao_id,
      hoc_ky: normalized.hoc_ky,
      nam_hoc: normalized.nam_hoc ?? null,
    };

    return activitiesRepo.create(createData);
  }

  /**
   * Update activity (with ownership check)
   */
  async update(id, data, user, scope) {
    // Check if activity exists in scope
    const existing = await activitiesRepo.findById(id, scope);
    
    if (!existing) {
      throw new NotFoundError('Hoạt động', id);
    }
    
    // Check ownership
    const canAccess = await canAccessItem('activities', id, user);
    if (!canAccess) {
      throw new ForbiddenError('Bạn không có quyền chỉnh sửa hoạt động này');
    }
    
    // Map and normalize incoming data
    const normalized = this.validationService.normalizeActivityData(
      this.validationService.mapIncomingFields(data)
    );
    
    // Validate dates if provided
    if (normalized.ngay_bd || normalized.ngay_kt || normalized.han_dk) {
      // Merge with existing dates for validation
      const datesToValidate = {
        ngay_bd: normalized.ngay_bd || existing.ngay_bd,
        ngay_kt: normalized.ngay_kt || existing.ngay_kt,
        han_dk: normalized.han_dk || existing.han_dk
      };
      this.validationService.validateDates(datesToValidate);
    }
    
    // Auto-infer semester if dates changed and semester not provided
    if ((normalized.ngay_bd || normalized.ngay_kt) && !normalized.hoc_ky && !normalized.nam_hoc) {
      const dateToUse = normalized.ngay_bd || existing.ngay_bd;
      if (dateToUse) {
        const semesterInfo = determineSemesterFromDate(new Date(dateToUse));
        normalized.hoc_ky = `hoc_ky_${semesterInfo.semester === 1 ? '1' : '2'}`;
        normalized.nam_hoc = String(semesterInfo.year);
      }
    }
    
    // Whitelist only Prisma model fields for update
    const updateData = {};
    if (normalized.ten_hd !== undefined) updateData.ten_hd = normalized.ten_hd;
    if (normalized.mo_ta !== undefined) updateData.mo_ta = normalized.mo_ta;
    if (normalized.loai_hd_id !== undefined) updateData.loai_hd_id = normalized.loai_hd_id;
    if (normalized.diem_rl !== undefined) updateData.diem_rl = normalized.diem_rl;
    if (normalized.dia_diem !== undefined) updateData.dia_diem = normalized.dia_diem;
    if (normalized.ngay_bd !== undefined) updateData.ngay_bd = normalized.ngay_bd;
    if (normalized.ngay_kt !== undefined) updateData.ngay_kt = normalized.ngay_kt;
    if (normalized.han_dk !== undefined) updateData.han_dk = normalized.han_dk;
    if (normalized.sl_toi_da !== undefined) updateData.sl_toi_da = normalized.sl_toi_da;
    if (normalized.trang_thai !== undefined) updateData.trang_thai = normalized.trang_thai;
    if (normalized.hinh_anh !== undefined) updateData.hinh_anh = Array.isArray(normalized.hinh_anh) ? normalized.hinh_anh : [];
    if (normalized.tep_dinh_kem !== undefined) updateData.tep_dinh_kem = Array.isArray(normalized.tep_dinh_kem) ? normalized.tep_dinh_kem : [];
    if (normalized.hoc_ky !== undefined) updateData.hoc_ky = normalized.hoc_ky;
    if (normalized.nam_hoc !== undefined) updateData.nam_hoc = normalized.nam_hoc;
    
    return activitiesRepo.update(id, updateData);
  }

  /**
   * Delete activity (with ownership and dependency check)
   */
  async delete(id, user, scope) {
    // Check if activity exists in scope
    const existing = await activitiesRepo.findById(id, scope);
    
    if (!existing) {
      throw new NotFoundError('Hoạt động', id);
    }
    
    // Check ownership
    const canAccess = await canAccessItem('activities', id, user);
    if (!canAccess) {
      throw new ForbiddenError('Bạn không có quyền xóa hoạt động này');
    }
    
    // Check if activity has registrations
    const stats = await activitiesRepo.getRegistrationStats(id);
    if (stats.total > 0) {
      throw new ValidationError('Không thể xóa hoạt động đã có người đăng ký');
    }
    
    return activitiesRepo.delete(id);
  }
}

module.exports = ActivityCRUDService;

