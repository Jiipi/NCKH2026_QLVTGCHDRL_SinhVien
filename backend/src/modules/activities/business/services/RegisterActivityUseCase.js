const { NotFoundError, ValidationError, ForbiddenError } = require('../../../../core/errors/AppError');
const { prisma } = require('../../../../data/infrastructure/prisma/client');
const CreateRegistrationDto = require('../../../registrations/business/dto/CreateRegistrationDto');

/**
 * RegisterActivityUseCase
 * Use case for registering for an activity
 * Follows Single Responsibility Principle (SRP)
 */
class RegisterActivityUseCase {
  constructor(createRegistrationUseCase) {
    this.createRegistrationUseCase = createRegistrationUseCase;
  }

  async execute(activityId, user) {
    // Get student ID from user ID
    const student = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub },
      select: { id: true }
    });
    
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

