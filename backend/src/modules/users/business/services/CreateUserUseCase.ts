import type { NguoiDung } from '@prisma/client';
import type IUserRepository from '../interfaces/IUserRepository';
import type { UserCreateInput } from '../interfaces/IUserRepository';
const CreateUserDto = require('../dto/CreateUserDto');
const { ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');
const bcrypt = require('bcryptjs');

interface AuthUser {
  id: string | number;
  role: string;
}

interface CreateUserDtoType {
  mssv: string;
  email: string;
  password: string;
  [key: string]: unknown;
}

/**
 * CreateUserUseCase
 * Use case for creating a new user
 * Follows Single Responsibility Principle (SRP)
 */
class CreateUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(dto: CreateUserDtoType, user: AuthUser): Promise<Partial<NguoiDung>> {
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
    } as unknown as UserCreateInput);

    // Remove password from response
    const result = { ...newUser } as Partial<NguoiDung> & { password?: string };
    delete result.password;

    return result;
  }
}

export default CreateUserUseCase;
module.exports = CreateUserUseCase;
