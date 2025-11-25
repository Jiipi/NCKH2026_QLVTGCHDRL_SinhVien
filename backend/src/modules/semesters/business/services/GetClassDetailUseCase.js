const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetClassDetailUseCase
 * Use case for getting class detail
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassDetailUseCase {
  constructor(semesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  async execute(classId) {
    const classDetail = await this.semesterRepository.getClassDetail(classId);

    if (!classDetail) {
      throw new NotFoundError('Không tìm thấy lớp');
    }

    return classDetail;
  }
}

module.exports = GetClassDetailUseCase;

