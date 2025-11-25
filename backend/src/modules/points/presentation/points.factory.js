const pointsRepository = require('../data/repositories/points.repository');
const GetPointsSummaryUseCase = require('../business/services/GetPointsSummaryUseCase');
const GetPointsDetailUseCase = require('../business/services/GetPointsDetailUseCase');
const GetAttendanceHistoryUseCase = require('../business/services/GetAttendanceHistoryUseCase');
const GetFilterOptionsUseCase = require('../business/services/GetFilterOptionsUseCase');
const GetPointsReportUseCase = require('../business/services/GetPointsReportUseCase');
const PointsController = require('./controllers/PointsController');

/**
 * Factory for creating PointsController with all dependencies
 * Implements Dependency Injection pattern
 */
function createPointsController() {
  // Data layer
  const repo = pointsRepository;

  // Business layer (Use Cases)
  const useCases = {
    getPointsSummary: new GetPointsSummaryUseCase(repo),
    getPointsDetail: new GetPointsDetailUseCase(repo),
    getAttendanceHistory: new GetAttendanceHistoryUseCase(repo),
    getFilterOptions: new GetFilterOptionsUseCase(repo),
    getPointsReport: new GetPointsReportUseCase(repo)
  };

  // Presentation layer
  const controller = new PointsController(useCases);

  return controller;
}

module.exports = { createPointsController };

