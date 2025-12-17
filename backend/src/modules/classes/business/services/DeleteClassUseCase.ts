import { NotFoundError, ForbiddenError, ValidationError } from '../../../../core/errors/AppError';
import type IClassRepository from '../interfaces/IClassRepository';

/**
 * User interface for authorization
 */
export interface AuthUser {
  id: number | string;
  role: string;
  class?: string;
}

/**
 * DeleteClassUseCase
 * Use case for deleting a class
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteClassUseCase {
  private classRepository: IClassRepository;

  constructor(classRepository: IClassRepository) {
    this.classRepository = classRepository;
  }

  async execute(id: string | number, user: AuthUser): Promise<{ message: string }> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được xóa class');
    }

    const classData = await this.classRepository.findById(id);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Check if class has students
    const stats = await this.classRepository.getStats(id);
    if (stats && stats.totalStudents > 0) {
      throw new ValidationError('Không thể xóa class đang có sinh viên');
    }

    // Delete
    await this.classRepository.delete(id);

    return { message: 'Đã xóa class thành công' };
  }
}

export default DeleteClassUseCase;
module.exports = DeleteClassUseCase;
