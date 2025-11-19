const CreateRegistrationDto = require('../dto/CreateRegistrationDto');
const { ValidationError, NotFoundError } = require('../../../../core/errors/AppError');
const { prisma } = require('../../../../infrastructure/prisma/client');

/**
 * CreateRegistrationUseCase
 * Use case for creating a registration
 */
class CreateRegistrationUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(dto, user) {
    if (!dto.activityId) {
      throw new ValidationError('activityId là bắt buộc');
    }

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(dto.activityId, 10) },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    if (activity.status && activity.status !== 'PUBLISHED') {
      throw new ValidationError('Hoạt động chưa mở đăng ký');
    }

    if (activity.maxParticipants && activity._count.registrations >= activity.maxParticipants) {
      throw new ValidationError('Hoạt động đã đủ số lượng đăng ký');
    }

    const existing = await this.registrationRepository.findByUserAndActivity(
      dto.userId || user.id,
      dto.activityId
    );

    if (existing) {
      throw new ValidationError('Bạn đã đăng ký hoạt động này rồi');
    }

    const now = new Date();
    if (activity.registrationDeadline && now > new Date(activity.registrationDeadline)) {
      throw new ValidationError('Đã hết hạn đăng ký');
    }

    const registration = await this.registrationRepository.create({
      userId: dto.userId || user.id,
      activityId: dto.activityId,
      status: 'PENDING',
      note: dto.note
    });

    return registration;
  }
}

module.exports = CreateRegistrationUseCase;

