import { NotFoundError } from '../../../../core/errors/AppError';
import type IClassRepository from '../interfaces/IClassRepository';
import type { HoatDong } from '@prisma/client';

/**
 * User interface for authorization
 */
export interface AuthUser {
  id: number | string;
  role: string;
  class?: string;
}

/**
 * GetClassActivitiesUseCase
 * Use case for getting activities for a class
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassActivitiesUseCase {
  private classRepository: IClassRepository;

  constructor(classRepository: IClassRepository) {
    this.classRepository = classRepository;
  }

  async execute(classId: string | number, _user: AuthUser): Promise<HoatDong[]> {
    const classData = await this.classRepository.findById(classId);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    const activities = await this.classRepository.getActivities(classId);
    return activities;
  }
}

export default GetClassActivitiesUseCase;
module.exports = GetClassActivitiesUseCase;
