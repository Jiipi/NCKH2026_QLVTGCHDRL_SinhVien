/**
 * Activity Approval Service
 * Handles approval and rejection of activities
 * Follows Single Responsibility Principle (SRP)
 */

const activitiesRepo = require('../activities.repo');
const { NotFoundError, ValidationError } = require('../../../core/errors/AppError');
const ActivityQRService = require('./ActivityQRService');

class ActivityApprovalService {
  constructor() {
    this.qrService = new ActivityQRService();
  }

  /**
   * Approve activity (GIANG_VIEN, ADMIN only)
   */
  async approve(id, user) {
    const activity = await activitiesRepo.findById(id);
    
    if (!activity) {
      throw new NotFoundError('Hoạt động', id);
    }
    
    if (activity.trang_thai === 'da_duyet') {
      throw new ValidationError('Hoạt động đã được duyệt');
    }
    
    // Generate QR token if not exists
    const updateData = {
      trang_thai: 'da_duyet'
    };
    
    if (!activity.qr) {
      updateData.qr = this.qrService.generateQRToken();
    }
    
    // Schema doesn't have nguoi_duyet_id/ngay_duyet fields
    // Only update trang_thai (ngay_cap_nhat will auto-update via @updatedAt)
    return activitiesRepo.update(id, updateData);
  }

  /**
   * Reject activity (GIANG_VIEN, ADMIN only)
   */
  async reject(id, reason, user) {
    const activity = await activitiesRepo.findById(id);
    
    if (!activity) {
      throw new NotFoundError('Hoạt động', id);
    }
    
    // Schema doesn't have nguoi_duyet_id/ngay_duyet fields
    // Only update trang_thai and ly_do_tu_choi (ngay_cap_nhat will auto-update via @updatedAt)
    return activitiesRepo.update(id, {
      trang_thai: 'tu_choi',
      ly_do_tu_choi: reason
    });
  }
}

module.exports = ActivityApprovalService;

