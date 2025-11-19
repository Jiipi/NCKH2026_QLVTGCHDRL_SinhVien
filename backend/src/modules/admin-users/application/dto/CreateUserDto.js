const { createAdminUserSchema } = require('../../admin-users.validators');
const { ValidationError } = require('../../../../core/errors/AppError');

/**
 * CreateUserDto
 * Data Transfer Object for creating a new user
 * Handles validation and data transformation
 */
class CreateUserDto {
  constructor(data) {
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

  static fromRequest(body) {
    try {
      const validatedData = createAdminUserSchema.parse(body);
      return new CreateUserDto(validatedData);
    } catch (error) {
      if (error.name === 'ZodError') {
        throw new ValidationError('Dữ liệu không hợp lệ', error.errors);
      }
      throw error;
    }
  }

  toDomain() {
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

module.exports = CreateUserDto;

