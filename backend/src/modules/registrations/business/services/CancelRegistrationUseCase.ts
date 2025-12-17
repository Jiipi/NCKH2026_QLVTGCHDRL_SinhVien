/**
 * CancelRegistrationUseCase
 * Use case for canceling a registration (student tự hủy)
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError, ForbiddenError, ValidationError } from '../../../../core/errors/AppError';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { IRegistrationRepository } from '../interfaces/IRegistrationRepository';
import type { AuthUser } from '../helpers/registrationAccess';
import type { TrangThaiDangKy } from '@prisma/client';

/**
 * Cancel result
 */
export interface CancelResult {
  message: string;
}

/**
 * CancelRegistrationUseCase
 */
export class CancelRegistrationUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id: string, user: AuthUser): Promise<CancelResult> {
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
    const status: TrangThaiDangKy = registration.trang_thai_dk;
    if (status === 'da_duyet' || status === 'da_tham_gia') {
      throw new ValidationError('Không thể hủy đăng ký đã được duyệt hoặc đã tham gia');
    }

    // Delete registration
    await prisma.dangKyHoatDong.delete({
      where: { id: String(id) }
    });

    return { message: 'Đã hủy đăng ký thành công' };
  }
}

export default CancelRegistrationUseCase;
module.exports = CancelRegistrationUseCase;
