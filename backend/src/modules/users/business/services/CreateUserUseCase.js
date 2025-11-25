const CreateUserDto = require('../dto/CreateUserDto');
const { ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');
const bcrypt = require('bcryptjs');

/**
 * CreateUserUseCase
 * Use case for creating a new user
 * Follows Single Responsibility Principle (SRP)
 */
class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(dto, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được tạo user');
    }

    // Check duplicate MSSV
    const existingMSSV = await this.userRepository.findByMSSV(dto.mssv);
    if (existingMSSV) {
      throw new ValidationError('MSSV đã tồn tại');
    }

    // Check duplicate email
    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ValidationError('Email đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const newUser = await this.userRepository.create({
      ...dto,
      password: hashedPassword
    });

    // Remove password from response
    delete newUser.password;

    return newUser;
  }
}

module.exports = CreateUserUseCase;

