/**
 * Teachers Module - TypeScript Index
 */

export type {
  TeacherDashboardStats,
  ClassStats,
  TeacherClass,
  TeacherClassIncludeOptions,
  TeacherStudentFilters,
  TeacherStudent,
  PendingActivity,
  ClassRegistrationFilters,
  ClassRegistration,
  ITeacherRepository,
  IGetTeacherDashboardUseCase,
  IGetTeacherClassesUseCase,
  IGetTeacherStudentsUseCase,
  ITeachersController
} from './teachers.types';

import routes from './presentation/routes/teachers.routes';
export { routes };
module.exports = { routes };
