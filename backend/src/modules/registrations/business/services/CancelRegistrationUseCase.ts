/**
 * CancelRegistrationUseCase
 * Use case for canceling a registration (student tự hủy)
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError, ForbiddenError, ValidationError } from '../../../../core/errors/AppError';
import type { IRegistrationRepository } from '../interfaces/IRegistrationRepository';
import type { AuthUser } from '../helpers/registrationAccess';
import type { TrangThaiDangKy } from '@prisma/client';

interface RegistrationWithOwner {
  id: string;
  trang_thai_dk: TrangThaiDangKy;
  student?: {
    nguoi_dung_id?: string;
  };
}

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
    const student = await this.registrationRepository.findStudentByUserId(user.sub || user.id || '');

    if (!student) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const registration = await this.registrationRepository.findById<RegistrationWithOwner>(id, { user: true });

    if (!registration) {
      throw new NotFoundError('Đăng ký không tồn tại');
    }

    // Authorization: Only owner can cancel (or ADMIN)
    if (registration.student?.nguoi_dung_id !== user.sub && user.role !== 'ADMIN') {
      throw new ForbiddenError('Bạn chỉ có thể hủy đăng ký của mình');
    }

    // Business rule: Cannot cancel if already approved or participated
    const status: TrangThaiDangKy = registration.trang_thai_dk;
    if (status === 'da_duyet' || status === 'da_tham_gia') {
      throw new ValidationError('Không thể hủy đăng ký đã được duyệt hoặc đã tham gia');
    }

    // Delete registration
    await this.registrationRepository.delete(id);

    return { message: 'Đã hủy đăng ký thành công' };
  }
}

export default CancelRegistrationUseCase;
module.exports = CancelRegistrationUseCase;
