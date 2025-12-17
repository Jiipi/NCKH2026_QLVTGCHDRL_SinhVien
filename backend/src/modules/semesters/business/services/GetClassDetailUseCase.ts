/**
 * GetClassDetailUseCase
 * Use case for getting class detail
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import type ISemesterRepository from '../interfaces/ISemesterRepository';
import type { ClassDetail } from '../interfaces/ISemesterRepository';

class GetClassDetailUseCase {
  private semesterRepository: ISemesterRepository;

  constructor(semesterRepository: ISemesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  async execute(classId: string): Promise<ClassDetail> {
    const classDetail = await this.semesterRepository.getClassDetail(classId);

    if (!classDetail) {
      throw new NotFoundError('Không tìm thấy lớp');
    }

    return classDetail;
  }
}

export default GetClassDetailUseCase;
module.exports = GetClassDetailUseCase;
