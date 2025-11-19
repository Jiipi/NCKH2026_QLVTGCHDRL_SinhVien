const { ValidationError } = require('../../../../core/errors/AppError');

/**
 * CreateClassDto
 * Data Transfer Object for creating a class
 */
class CreateClassDto {
  constructor() {
    this.name = null;
    this.faculty = null;
    this.major = null;
    this.academicYear = null;
    this.semester = null;
  }

  static fromRequest(body) {
    const dto = new CreateClassDto();
    
    if (!body.name) {
      throw new ValidationError('Tên class là bắt buộc');
    }

    dto.name = body.name?.trim();
    dto.faculty = body.faculty || null;
    dto.major = body.major || null;
    dto.academicYear = body.academicYear || null;
    dto.semester = body.semester || null;

    return dto;
  }
}

module.exports = CreateClassDto;

