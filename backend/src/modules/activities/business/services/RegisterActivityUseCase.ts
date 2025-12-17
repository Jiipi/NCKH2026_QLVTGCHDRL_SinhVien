/**
 * RegisterActivityUseCase
 * Use case for registering for an activity
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError, ValidationError, ForbiddenError } from '../../../../core/errors/AppError';
import CreateRegistrationDto from '../../../registrations/business/dto/CreateRegistrationDto';
import type { CreateRegistrationUseCase as CreateRegistrationUseCaseType } from '../../../registrations/business/services/CreateRegistrationUseCase';
import type IActivityRepository from '../interfaces/IActivityRepository';

/**
 * User context for authentication
 */
interface AuthUser {
  sub: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Student record
 */
interface StudentRecord {
  id: string;
}

/**
 * Extended repository with student lookup
 */
interface ExtendedActivityRepository extends IActivityRepository {
  findStudentByUserId?(userId: string): Promise<StudentRecord | null>;
}

/**
 * RegisterActivityUseCase
 */
class RegisterActivityUseCase {
  private createRegistrationUseCase: CreateRegistrationUseCaseType;
  private activityRepository: ExtendedActivityRepository | null;

  constructor(
    createRegistrationUseCase: CreateRegistrationUseCaseType,
    activityRepository: ExtendedActivityRepository | null = null
  ) {
    this.createRegistrationUseCase = createRegistrationUseCase;
    this.activityRepository = activityRepository;
  }

  async execute(activityId: string, user: AuthUser): Promise<unknown> {
    // Get student ID from user ID using repository if available
    let student: StudentRecord | null;
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

export default RegisterActivityUseCase;
module.exports = RegisterActivityUseCase;
