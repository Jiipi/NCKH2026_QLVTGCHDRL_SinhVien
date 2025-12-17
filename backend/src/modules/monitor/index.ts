/**
 * Monitor Module - TypeScript Index
 */

export type {
  MonitorStudentInfo,
  StudentRegistration,
  ClassRegistrationForPoints,
  StudentPointsSummary,
  ClassPointsRanking,
  MonitorActivityFilter,
  IMonitorRepository,
  IGetClassStudentsUseCase,
  IGetStudentPointsUseCase,
  IGetClassRankingUseCase,
  IGetStudentActivitiesUseCase,
  IMonitorController
} from './monitor.types';

import routes from './presentation/routes/monitor.routes';
export { routes };
module.exports = { routes };
