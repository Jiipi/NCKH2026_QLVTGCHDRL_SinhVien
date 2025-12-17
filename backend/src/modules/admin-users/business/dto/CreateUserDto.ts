/**
 * CreateUserDto
 * Data Transfer Object for creating a new user
 * Handles validation and data transformation
 */

import { createAdminUserSchema, CreateAdminUserData, GenderType } from '../validators/admin-users.validators';
import { ValidationError } from '../../../../core/errors/AppError';

export interface CreateUserDtoData {
  maso: string;
  hoten: string;
  email: string;
  password: string;
  role: string;
  mssv?: string;
  lop_id?: string;
  ngay_sinh?: string;
  gt?: GenderType;
  dia_chi?: string;
  sdt?: string;
  set_lop_truong?: boolean;
}

class CreateUserDto implements CreateUserDtoData {
  maso: string;
  hoten: string;
  email: string;
  password: string;
  role: string;
  mssv?: string;
  lop_id?: string;
  ngay_sinh?: string;
  gt?: GenderType;
  dia_chi?: string;
  sdt?: string;
  set_lop_truong?: boolean;

  constructor(data: CreateAdminUserData) {
    this.maso = data.maso;
    this.hoten = data.hoten;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.mssv = data.mssv;
    this.lop_id = data.lop_id;
    this.ngay_sinh = data.ngay_sinh;
    this.gt = data.gt;
    this.dia_chi = data.dia_chi;
    this.sdt = data.sdt;
    this.set_lop_truong = data.set_lop_truong;
  }

  static fromRequest(body: unknown): CreateUserDto {
    try {
      const validatedData = createAdminUserSchema.parse(body);
      return new CreateUserDto(validatedData);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw new ValidationError('Dữ liệu không hợp lệ', error.errors);
      }
      throw error;
    }
  }

  toDomain(): CreateUserDtoData {
    return {
      maso: this.maso,
      hoten: this.hoten,
      email: this.email,
      password: this.password,
      role: this.role,
      mssv: this.mssv,
      lop_id: this.lop_id,
      ngay_sinh: this.ngay_sinh,
      gt: this.gt,
      dia_chi: this.dia_chi,
      sdt: this.sdt,
      set_lop_truong: this.set_lop_truong
    };
  }
}

export default CreateUserDto;
module.exports = CreateUserDto;
