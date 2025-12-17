/**
 * Factory for creating PointsController with all dependencies
 * Implements Dependency Injection pattern
 */
import pointsRepository from '../data/repositories/points.repository';
import GetPointsSummaryUseCase from '../business/services/GetPointsSummaryUseCase';
import GetPointsDetailUseCase from '../business/services/GetPointsDetailUseCase';
import GetAttendanceHistoryUseCase from '../business/services/GetAttendanceHistoryUseCase';
import GetFilterOptionsUseCase from '../business/services/GetFilterOptionsUseCase';
import GetPointsReportUseCase from '../business/services/GetPointsReportUseCase';
import PointsController from './controllers/PointsController';

function createPointsController(): PointsController {
  // Data layer
  const repo = pointsRepository;

  // Business layer (Use Cases)
  const useCases = {
    getPointsSummary: new GetPointsSummaryUseCase(repo),
    getPointsDetail: new GetPointsDetailUseCase(repo),
    getAttendanceHistory: new GetAttendanceHistoryUseCase(repo),
    getFilterOptions: new GetFilterOptionsUseCase(repo),
    getPointsReport: new GetPointsReportUseCase(repo),
  };

  // Presentation layer
  const controller = new PointsController(useCases);

  return controller;
}

export { createPointsController };
module.exports = { createPointsController };
