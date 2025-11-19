const PointsPrismaRepository = require('../infrastructure/repositories/PointsPrismaRepository');
const GetPointsSummaryUseCase = require('../application/use-cases/GetPointsSummaryUseCase');
const GetPointsDetailUseCase = require('../application/use-cases/GetPointsDetailUseCase');
const GetAttendanceHistoryUseCase = require('../application/use-cases/GetAttendanceHistoryUseCase');
const GetFilterOptionsUseCase = require('../application/use-cases/GetFilterOptionsUseCase');
const GetPointsReportUseCase = require('../application/use-cases/GetPointsReportUseCase');
const PointsController = require('./PointsController');

/**
 * Factory for creating PointsController with all dependencies
 * Implements Dependency Injection pattern
 */
function createPointsController() {
  // Infrastructure layer
  const pointsRepository = new PointsPrismaRepository();

  // Application layer (Use Cases)
  const useCases = {
    getPointsSummary: new GetPointsSummaryUseCase(pointsRepository),
    getPointsDetail: new GetPointsDetailUseCase(pointsRepository),
    getAttendanceHistory: new GetAttendanceHistoryUseCase(pointsRepository),
    getFilterOptions: new GetFilterOptionsUseCase(pointsRepository),
    getPointsReport: new GetPointsReportUseCase(pointsRepository)
  };

  // Presentation layer
  const controller = new PointsController(useCases);

  return controller;
}

module.exports = { createPointsController };

