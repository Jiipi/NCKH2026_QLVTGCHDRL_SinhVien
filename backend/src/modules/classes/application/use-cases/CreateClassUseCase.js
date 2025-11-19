const CreateClassDto = require('../dto/CreateClassDto');
const { ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');

/**
 * CreateClassUseCase
 * Use case for creating a new class
 * Follows Single Responsibility Principle (SRP)
 */
class CreateClassUseCase {
  constructor(classRepository) {
    this.classRepository = classRepository;
  }

  async execute(dto, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được tạo class');
    }

    // Check duplicate
    const existing = await this.classRepository.findByName(dto.name);
    if (existing) {
      throw new ValidationError('Class đã tồn tại');
    }

    // Create
    const newClass = await this.classRepository.create(dto);

    return newClass;
  }
}

module.exports = CreateClassUseCase;

