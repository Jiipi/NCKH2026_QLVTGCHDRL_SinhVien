import { NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import type IClassRepository from '../interfaces/IClassRepository';
import type { Lop } from '@prisma/client';

/**
 * User interface for authorization
 */
export interface AuthUser {
  id: number | string;
  role: string;
  class?: string;
}

/**
 * Class data with optional relations
 */
export interface ClassWithRelations extends Lop {
  students?: unknown[];
  teachers?: unknown[];
  _count?: {
    students?: number;
    activities?: number;
  };
}

/**
 * GetClassByIdUseCase
 * Use case for getting a class by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassByIdUseCase {
  private classRepository: IClassRepository;

  constructor(classRepository: IClassRepository) {
    this.classRepository = classRepository;
  }

  async execute(id: string | number, user: AuthUser, includeStudents: boolean = false): Promise<ClassWithRelations> {
    const classData = await this.classRepository.findById(id, {
      students: includeStudents,
      teachers: true
    }) as ClassWithRelations;

    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Check authorization
    await this.checkAccess(classData, user);

    return classData;
  }

  private async checkAccess(classData: ClassWithRelations, user: AuthUser): Promise<boolean> {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'GIANG_VIEN') return true;
    if ((classData as unknown as { name?: string }).name === user.class) return true;
    throw new ForbiddenError('Bạn không có quyền xem class này');
  }
}

export default GetClassByIdUseCase;
module.exports = GetClassByIdUseCase;
