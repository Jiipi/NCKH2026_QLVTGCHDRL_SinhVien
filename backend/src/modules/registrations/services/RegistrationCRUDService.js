/**
 * Registration CRUD Service
 * Handles create, cancel operations for registrations
 * Follows Single Responsibility Principle (SRP)
 */

const { prisma } = require('../../../infrastructure/prisma/client');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../../core/errors/AppError');
const registrationsRepo = require('../registrations.repo');

class RegistrationCRUDService {
  /**
   * Tạo registration mới (student đăng ký hoạt động)
   */
  async create(data, user) {
    // Validate input
    if (!data.activityId) {
      throw new ValidationError('activityId là bắt buộc');
    }

    // Check activity exists và còn slot
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(data.activityId) },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Check activity status
    if (activity.status !== 'PUBLISHED') {
      throw new ValidationError('Hoạt động chưa mở đăng ký');
    }

    // Check max participants
    if (activity.maxParticipants && activity._count.registrations >= activity.maxParticipants) {
      throw new ValidationError('Hoạt động đã đủ số lượng đăng ký');
    }

    // Check duplicate registration
    const existing = await registrationsRepo.findByUserAndActivity(
      data.userId || user.id,
      data.activityId
    );

    if (existing) {
      throw new ValidationError('Bạn đã đăng ký hoạt động này rồi');
    }

    // Check registration deadline
    const now = new Date();
    if (activity.registrationDeadline && now > new Date(activity.registrationDeadline)) {
      throw new ValidationError('Đã hết hạn đăng ký');
    }

    // Create registration
    const registration = await registrationsRepo.create({
      userId: data.userId || user.id,
      activityId: data.activityId,
      status: 'PENDING',
      note: data.note
    });

    return registration;
  }

  /**
   * Register for activity (student registers for activity)
   */
  async register(activityId, user) {
    // Check if activity exists
    const activity = await prisma.hoatDong.findUnique({
      where: { id: activityId },
      include: {
        _count: {
          select: { dang_ky_hd: true }
        }
      }
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động', activityId);
    }

    // Check if activity is approved
    if (activity.trang_thai !== 'da_duyet') {
      throw new ValidationError('Hoạt động chưa được duyệt hoặc đã bị từ chối');
    }

    // Check registration deadline
    if (activity.han_dk) {
      const now = new Date();
      if (now > new Date(activity.han_dk)) {
        throw new ValidationError('Đã hết hạn đăng ký hoạt động này');
      }
    }

    // Check max participants
    if (activity.sl_toi_da && activity._count.dang_ky_hd >= activity.sl_toi_da) {
      throw new ValidationError('Hoạt động đã đủ số lượng đăng ký');
    }

    // Get student info
    const student = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub }
    });

    if (!student) {
      throw new ForbiddenError('Chỉ sinh viên mới có thể đăng ký hoạt động');
    }

    // Check if already registered
    const existing = await prisma.dangKyHoatDong.findUnique({
      where: {
        sv_id_hd_id: {
          sv_id: student.id,
          hd_id: activityId
        }
      }
    });

    if (existing) {
      throw new ValidationError('Bạn đã đăng ký hoạt động này rồi');
    }

    // Create registration
    const registration = await prisma.dangKyHoatDong.create({
      data: {
        sv_id: student.id,
        hd_id: activityId,
        trang_thai_dk: 'cho_duyet'
      },
      include: {
        hoat_dong: true,
        sinh_vien: {
          include: {
            nguoi_dung: true
          }
        }
      }
    });

    return registration;
  }

  /**
   * Cancel registration (student tự hủy)
   */
  async cancel(id, user) {
    // Get student ID from user ID
    const student = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub },
      select: { id: true }
    });
    
    if (!student) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // Find registration
    const registration = await prisma.dangKyHoatDong.findUnique({
      where: { id: String(id) },
      include: {
        sinh_vien: {
          select: { nguoi_dung_id: true }
        }
      }
    });

    if (!registration) {
      throw new NotFoundError('Đăng ký không tồn tại');
    }

    // Only owner can cancel
    if (registration.sinh_vien?.nguoi_dung_id !== user.sub && user.role !== 'ADMIN') {
      throw new ForbiddenError('Bạn chỉ có thể hủy đăng ký của mình');
    }

    // Check if can cancel (chưa approve - chỉ có thể hủy khi đang chờ duyệt)
    if (registration.trang_thai_dk === 'da_duyet' || registration.trang_thai_dk === 'da_tham_gia') {
      throw new ValidationError('Không thể hủy đăng ký đã được duyệt hoặc đã tham gia');
    }

    // Delete registration
    await prisma.dangKyHoatDong.delete({
      where: { id: String(id) }
    });

    return { message: 'Đã hủy đăng ký thành công' };
  }
}

module.exports = RegistrationCRUDService;

