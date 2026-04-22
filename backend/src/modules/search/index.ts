/**
 * Search Module - TypeScript Index
 */

export type {
  ActivitySearchResult,
  StudentSearchResult,
  ClassSearchResult,
  TeacherSearchResult,
  SearchQueryOptions,
  ActivitySearchFilters,
  StudentSearchFilters,
  ClassSearchFilters,
  TeacherSearchFilters,
  GlobalSearchResponse,
  ISearchRepository,
  IGlobalSearchUseCase,
  ISearchActivitiesUseCase,
  ISearchStudentsUseCase,
  ISearchController
} from './search.types';

import routes from './presentation/routes/search.routes';
export { routes };
module.exports = { routes };
