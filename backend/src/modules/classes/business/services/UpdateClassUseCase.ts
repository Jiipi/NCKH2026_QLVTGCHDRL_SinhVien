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
 * Update class data interface
 */
export interface UpdateClassData {
  name?: string;
  faculty?: string | null;
  major?: string | null;
  academicYear?: string | null;
  semester?: string | null;
}

/**
 * UpdateClassUseCase
 * Use case for updating a class
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateClassUseCase {
  private classRepository: IClassRepository;

  constructor(classRepository: IClassRepository) {
    this.classRepository = classRepository;
  }

  async execute(id: string | number, data: UpdateClassData, user: AuthUser): Promise<Lop> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được cập nhật class');
    }

    const classData = await this.classRepository.findById(id);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Update
    const updated = await this.classRepository.update(id, data as Partial<Lop>);

    return updated;
  }
}

export default UpdateClassUseCase;
module.exports = UpdateClassUseCase;
