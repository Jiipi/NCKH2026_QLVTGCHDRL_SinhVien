import type CreateClassDto from '../dto/CreateClassDto';
import { ForbiddenError, ValidationError } from '../../../../core/errors/AppError';
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
 * CreateClassUseCase
 * Use case for creating a new class
 * Follows Single Responsibility Principle (SRP)
 */
class CreateClassUseCase {
  private classRepository: IClassRepository;

  constructor(classRepository: IClassRepository) {
    this.classRepository = classRepository;
  }

  async execute(dto: CreateClassDto, user: AuthUser): Promise<Lop> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được tạo class');
    }

    // Check duplicate
    const existing = await this.classRepository.findByName(dto.name!);
    if (existing) {
      throw new ValidationError('Class đã tồn tại');
    }

    // Create
    const newClass = await this.classRepository.create(dto as unknown as Partial<Lop>);

    return newClass;
  }
}

export default CreateClassUseCase;
module.exports = CreateClassUseCase;
