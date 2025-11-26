const { updateAdminUserSchema } = require('../validators/admin-users.validators');
const { ValidationError } = require('../../../../core/errors/AppError');

/**
 * UpdateUserDto
 * Data Transfer Object for updating a user
 * Handles validation and data transformation
 */
class UpdateUserDto {
  constructor(data) {
    this.hoten = data.hoten;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.maso = data.maso;
    this.trang_thai = data.trang_thai;
    this.student = data.student;
    this.set_lop_truong = data.set_lop_truong;
  }

  static fromRequest(body) {
    try {
      const validatedData = updateAdminUserSchema.parse(body);
      return new UpdateUserDto(validatedData);
    } catch (error) {
      if (error.name === 'ZodError') {
        throw new ValidationError('Dữ liệu không hợp lệ', error.errors);
      }
      throw error;
    }
  }

  hasUpdates() {
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

module.exports = UpdateUserDto;

