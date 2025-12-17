/**
 * UpdateUserDto
 * Data Transfer Object for updating a user
 * Handles validation and data transformation
 */

import { updateAdminUserSchema, UpdateAdminUserData, StudentUpdateData } from '../validators/admin-users.validators';
import { ValidationError } from '../../../../core/errors/AppError';

export interface UpdateUserDtoData {
  hoten?: string;
  email?: string;
  password?: string;
  role?: string;
  maso?: string;
  trang_thai?: 'hoat_dong' | 'khong_hoat_dong' | 'khoa';
  student?: StudentUpdateData;
  set_lop_truong?: boolean;
}

class UpdateUserDto implements UpdateUserDtoData {
  hoten?: string;
  email?: string;
  password?: string;
  role?: string;
  maso?: string;
  trang_thai?: 'hoat_dong' | 'khong_hoat_dong' | 'khoa';
  student?: StudentUpdateData;
  set_lop_truong?: boolean;

  constructor(data: UpdateAdminUserData) {
    this.hoten = data.hoten;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.maso = data.maso;
    this.trang_thai = data.trang_thai;
    this.student = data.student;
    this.set_lop_truong = data.set_lop_truong;
  }

  static fromRequest(body: unknown): UpdateUserDto {
    try {
      const validatedData = updateAdminUserSchema.parse(body);
      return new UpdateUserDto(validatedData);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw new ValidationError('Dữ liệu không hợp lệ', error.errors);
      }
      throw error;
    }
  }

  hasUpdates(): boolean {
    return !!(
      this.hoten ||
      this.email ||
      this.password ||
      this.role ||
      this.maso ||
      this.trang_thai ||
      this.student
    );
  }
}

export default UpdateUserDto;
module.exports = UpdateUserDto;
