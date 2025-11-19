const { ValidationError } = require('../../../../core/errors/AppError');

/**
 * CreateUserDto
 * Data Transfer Object for creating a user
 */
class CreateUserDto {
  constructor() {
    this.mssv = null;
    this.fullName = null;
    this.email = null;
    this.password = null;
    this.role = 'SINH_VIEN';
    this.class = null;
    this.major = null;
    this.faculty = null;
    this.phone = null;
    this.address = null;
  }

  static fromRequest(body) {
    const dto = new CreateUserDto();
    
    if (!body.mssv || !body.fullName || !body.email || !body.password) {
      throw new ValidationError('Thiếu thông tin bắt buộc: mssv, fullName, email, password');
    }

    dto.mssv = body.mssv?.trim();
    dto.fullName = body.fullName?.trim();
    dto.email = body.email?.trim().toLowerCase();
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

module.exports = CreateUserDto;

