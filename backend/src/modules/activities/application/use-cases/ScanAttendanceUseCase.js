const { NotFoundError, ValidationError, ForbiddenError } = require('../../../../core/errors/AppError');
const { prisma } = require('../../../../infrastructure/prisma/client');

/**
 * ScanAttendanceUseCase
 * Use case for scanning QR code to check in attendance
 * Follows Single Responsibility Principle (SRP)
 */
class ScanAttendanceUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(activityId, token, scope, user) {
    if (!token) {
      throw new ValidationError('Thiếu mã QR');
    }

    // Build where clause from scope
    const where = {};
    if (scope && scope.activityFilter) {
      Object.assign(where, scope.activityFilter);
    }

    // Ensure activity exists and is accessible
    const activity = await this.activityRepository.findById(activityId, where);
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Validate QR token
    const serverToken = activity.qr || activity.qr_token;
    if (!serverToken || serverToken !== token) {
      throw new ValidationError('Mã QR không hợp lệ hoặc đã hết hạn');
    }

    // Get current student by user
    const student = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub },
      select: { id: true, lop_id: true }
    });

    if (!student) {
      throw new ForbiddenError('Chỉ sinh viên mới có thể điểm danh bằng QR');
    }

    // Check approved registration exists
    const registration = await prisma.dangKyHoatDong.findUnique({
      where: {
        sv_id_hd_id: { sv_id: student.id, hd_id: String(activityId) }
      },
      select: { id: true, trang_thai_dk: true }
    });

    if (!registration) {
      throw new ValidationError('Bạn chưa đăng ký hoạt động này');
    }

    if (registration.trang_thai_dk !== 'da_duyet') {
      throw new ValidationError('Đăng ký chưa được duyệt, không thể điểm danh');
    }

    // Prevent duplicate attendance
    const existed = await prisma.diemDanh.findUnique({
      where: {
        sv_id_hd_id: { sv_id: student.id, hd_id: String(activityId) }
      }
    });

    if (existed) {
      throw new ValidationError('Bạn đã điểm danh hoạt động này trước đó', 409);
    }

    // Create attendance record
    const created = await prisma.diemDanh.create({
      data: {
        nguoi_diem_danh_id: user.sub,
        sv_id: student.id,
        hd_id: String(activityId),
        phuong_thuc: 'qr',
        trang_thai_tham_gia: 'co_mat',
        xac_nhan_tham_gia: true
      }
    });

    // Update registration status to 'da_tham_gia' if currently approved
    try {
      if (registration.trang_thai_dk === 'da_duyet') {
        await prisma.dangKyHoatDong.update({
          where: { sv_id_hd_id: { sv_id: student.id, hd_id: String(activityId) } },
          data: { trang_thai_dk: 'da_tham_gia' }
        });
      }
    } catch (_) {
      // Non-fatal: attendance succeeded even if status update failed
    }

    return {
      attendanceId: created.id,
      activityId: activity.id,
      activityName: activity.ten_hd,
      timestamp: created.tg_diem_danh,
      sessionName: 'Mặc định'
    };
  }
}

module.exports = ScanAttendanceUseCase;

