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

import routes from './presentation/routes/semesters.routes';
import * as validators from './business/validators/semesters.validators';
import { createSemestersController } from './presentation/semesters.factory';
export { routes, validators, createSemestersController };
module.exports = { routes, validators, createSemestersController };
