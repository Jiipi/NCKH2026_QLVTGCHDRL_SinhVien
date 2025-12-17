import { ValidationError } from '../../../../core/errors/AppError';
import type { VaiTro } from '@prisma/client';

/**
 * Request body interface for creating a user
 */
export interface CreateUserRequestBody {
  mssv?: string;
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
  class?: string | null;
  major?: string | null;
  faculty?: string | null;
  phone?: string | null;
  address?: string | null;
}

/**
 * CreateUserDto
 * Data Transfer Object for creating a user
 */
class CreateUserDto {
  mssv: string | null = null;
  fullName: string | null = null;
  email: string | null = null;
  password: string | null = null;
  role: string = 'SINH_VIEN';
  class: string | null = null;
  major: string | null = null;
  faculty: string | null = null;
  phone: string | null = null;
  address: string | null = null;

  static fromRequest(body: CreateUserRequestBody): CreateUserDto {
    const dto = new CreateUserDto();
    
    if (!body.mssv || !body.fullName || !body.email || !body.password) {
      throw new ValidationError('Thiếu thông tin bắt buộc: mssv, fullName, email, password');
    }

    dto.mssv = body.mssv?.trim() ?? null;
    dto.fullName = body.fullName?.trim() ?? null;
    dto.email = body.email?.trim().toLowerCase() ?? null;
    dto.password = body.password;
    dto.role = body.role || 'SINH_VIEN';
    dto.class = body.class || null;
    dto.major = body.major || null;
    dto.faculty = body.faculty || null;
    dto.phone = body.phone || null;
    dto.address = body.address || null;

    return dto;
  }
}

export default CreateUserDto;
module.exports = CreateUserDto;
