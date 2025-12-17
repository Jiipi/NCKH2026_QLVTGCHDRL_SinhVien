/**
 * Semesters Module - TypeScript Index
 */

export type {
  SemesterOption,
  ParsedSemester,
  AcademicYearFilter,
  ClassWithDetails,
  ClassDetail,
  ClassStudent,
  SemesterActivityStats,
  SemesterRegistrationStats,
  ISemesterRepository,
  IGetSemesterOptionsUseCase,
  IGetClassesUseCase,
  IGetClassDetailUseCase,
  ISemesterValidators,
  ISemestersController
} from './semesters.types';

// Re-export factory
export { createSemestersController } from './presentation/semesters.factory';

const routes = require('./presentation/routes/semesters.routes');
const validators = require('./business/validators/semesters.validators');
const { createSemestersController } = require('./presentation/semesters.factory');
export { routes, validators };
module.exports = { routes, validators, createSemestersController };
