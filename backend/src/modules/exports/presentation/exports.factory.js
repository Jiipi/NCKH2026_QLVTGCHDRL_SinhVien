const ExportPrismaRepository = require('../infrastructure/repositories/ExportPrismaRepository');
const GetOverviewUseCase = require('../application/use-cases/GetOverviewUseCase');
const ExportActivitiesUseCase = require('../application/use-cases/ExportActivitiesUseCase');
const ExportRegistrationsUseCase = require('../application/use-cases/ExportRegistrationsUseCase');
const ExportsController = require('./ExportsController');

/**
 * Factory for creating ExportsController with all dependencies
 * Implements Dependency Injection pattern
 */
function createExportsController() {
  // Infrastructure layer
  const exportRepository = new ExportPrismaRepository();

  // Application layer (Use Cases)
  const useCases = {
    getOverview: new GetOverviewUseCase(exportRepository),
    exportActivities: new ExportActivitiesUseCase(exportRepository),
    exportRegistrations: new ExportRegistrationsUseCase(exportRepository)
  };

  // Presentation layer
  const controller = new ExportsController(useCases);

  return controller;
}

module.exports = { createExportsController };

