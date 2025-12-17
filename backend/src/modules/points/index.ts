/**
 * Points Module - TypeScript Index
 */

export type {
  StudentWithDetails,
  ActivityTypePoints,
  AttendedRegistration,
  PointsByCategory,
  StudentPointsSummary,
  PointsCalculationResult,
  RankingLevel,
  RankingThresholds,
  ClassRankingEntry,
  PointsFilterOptions,
  ParsedSemesterFilter,
  RegistrationStatusCount,
  PointsPaginationOptions,
  PaginatedPointsHistory,
  IPointsRepository,
  IGetStudentPointsUseCase,
  IGetPointsHistoryUseCase,
  IGetClassRankingUseCase,
  ICalculatePointsUseCase,
  IPointsController,
  IPointsUtils
} from './points.types';

const routes = require('./presentation/routes/points.routes');
export { routes };
module.exports = { routes };
