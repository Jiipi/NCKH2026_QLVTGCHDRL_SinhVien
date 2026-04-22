/**
 * Classes Module - TypeScript Index
 */

export type {
  Class,
  ClassWithCounts,
  ClassWithRelations,
  CreateClassDto,
  UpdateClassDto,
  ListClassesDto,
  ClassDto,
  ClassFilterOptions,
  ClassQueryOptions,
  ClassIncludeOptions,
  PaginatedClassesResult,
  IClassesRepository,
  IGetClassesUseCase,
  IGetClassByIdUseCase,
  ICreateClassUseCase,
  IUpdateClassUseCase,
  IDeleteClassUseCase,
  IClassesController,
  IClassValidator
} from './classes.types';

import routes from './presentation/routes/classes.routes';
export { routes };
module.exports = { routes };
