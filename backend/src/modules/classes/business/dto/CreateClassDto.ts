import { ValidationError } from '../../../../core/errors/AppError';

/**
 * Request body interface for creating a class
 */
export interface CreateClassRequestBody {
  name?: string;
  faculty?: string | null;
  major?: string | null;
  academicYear?: string | null;
  semester?: string | null;
}

/**
 * CreateClassDto
 * Data Transfer Object for creating a class
 */
class CreateClassDto {
  name: string | null = null;
  faculty: string | null = null;
  major: string | null = null;
  academicYear: string | null = null;
  semester: string | null = null;

  static fromRequest(body: CreateClassRequestBody): CreateClassDto {
    const dto = new CreateClassDto();
    
    if (!body.name) {
      throw new ValidationError('Tên class là bắt buộc');
    }

    dto.name = body.name?.trim() || null;
    dto.faculty = body.faculty || null;
    dto.major = body.major || null;
    dto.academicYear = body.academicYear || null;
    dto.semester = body.semester || null;

    return dto;
  }
}

export default CreateClassDto;
module.exports = CreateClassDto;
