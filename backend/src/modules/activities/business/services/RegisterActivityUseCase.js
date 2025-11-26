const { NotFoundError, ValidationError, ForbiddenError } = require('../../../../core/errors/AppError');
const CreateRegistrationDto = require('../../../registrations/business/dto/CreateRegistrationDto');

/**
 * RegisterActivityUseCase
 * Use case for registering for an activity
 * Follows Single Responsibility Principle (SRP)
 */
class RegisterActivityUseCase {
  constructor(createRegistrationUseCase, activityRepository = null) {
    this.createRegistrationUseCase = createRegistrationUseCase;
    this.activityRepository = activityRepository;
  }

  async execute(activityId, user) {
    // Get student ID from user ID using repository if available
    let student;
    if (this.activityRepository && this.activityRepository.findStudentByUserId) {
      student = await this.activityRepository.findStudentByUserId(user.sub);
    } else {
      // Fallback to direct prisma (for backward compatibility)
      const { prisma } = require('../../../../data/infrastructure/prisma/client');
      student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: user.sub },
        select: { id: true }
      });
    }
    
    if (!student) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // Create registration DTO - userId should be student.id (sv_id)
    // activityId có thể là UUID (string) hoặc số, nên không parse
    const dto = CreateRegistrationDto.fromRequest({
      activityId: activityId, // Giữ nguyên, không parse vì có thể là UUID
      userId: student.id
    }, user);

    // Use create registration use case
    const result = await this.createRegistrationUseCase.execute(dto, user);
    return result;
  }
}

module.exports = RegisterActivityUseCase;

