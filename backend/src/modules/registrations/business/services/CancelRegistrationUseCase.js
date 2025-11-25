const { NotFoundError, ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');
const { prisma } = require('../../../../data/infrastructure/prisma/client');

/**
 * CancelRegistrationUseCase
 * Use case for canceling a registration (student tự hủy)
 * Follows Single Responsibility Principle (SRP)
 */
class CancelRegistrationUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, user) {
    // Get student ID from user ID
    const student = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub },
      select: { id: true }
    });

    if (!student) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // Find registration using repository abstraction
    // Note: Using direct Prisma query for legacy schema compatibility
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

    // Authorization: Only owner can cancel (or ADMIN)
    if (registration.sinh_vien?.nguoi_dung_id !== user.sub && user.role !== 'ADMIN') {
      throw new ForbiddenError('Bạn chỉ có thể hủy đăng ký của mình');
    }

    // Business rule: Cannot cancel if already approved or participated
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

module.exports = CancelRegistrationUseCase;

