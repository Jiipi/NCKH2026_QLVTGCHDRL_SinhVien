/**
 * CreateRegistrationUseCase
 * Use case for creating a registration
 */

import { CreateRegistrationDto } from '../dto/CreateRegistrationDto';
import { ValidationError, NotFoundError } from '../../../../core/errors/AppError';
import type { IRegistrationRepository } from '../interfaces/IRegistrationRepository';
import type { AuthUser } from '../helpers/registrationAccess';

/**
 * Activity query result type
 */
/**
 * CreateRegistrationUseCase
 */
export class CreateRegistrationUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(dto: CreateRegistrationDto, user: AuthUser): Promise<unknown> {
    if (!dto.activityId) {
      throw new ValidationError('activityId là bắt buộc');
    }

    if (!dto.userId) {
      throw new ValidationError('userId là bắt buộc');
    }

    const activity = await this.registrationRepository.findActivityForRegistrationValidation(dto.activityId);

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Check if activity is approved
    if (activity.trang_thai !== 'da_duyet') {
      throw new ValidationError('Hoạt động chưa được duyệt');
    }

    // Check max participants
    if (activity.sl_toi_da && activity._count.dang_ky_hd >= activity.sl_toi_da) {
      throw new ValidationError('Hoạt động đã đủ số lượng đăng ký');
    }

    // Check registration deadline
    const now = new Date();
    if (activity.han_dk && now > new Date(activity.han_dk)) {
      throw new ValidationError('Đã hết hạn đăng ký');
    }

    // Check if already registered
    const existing = await this.registrationRepository.findByUserAndActivity(
      dto.userId,
      dto.activityId
    );

    if (existing) {
      throw new ValidationError('Bạn đã đăng ký hoạt động này rồi');
    }

    // Create registration
    // Map status: 'PENDING' -> 'cho_duyet' (theo schema)
    const registration = await this.registrationRepository.create({
      userId: dto.userId,
      activityId: dto.activityId,
      trang_thai_dk: 'cho_duyet', // Dùng trực tiếp trang_thai_dk thay vì status
      note: dto.note
    });

    return registration;
  }
}

export default CreateRegistrationUseCase;
module.exports = CreateRegistrationUseCase;
