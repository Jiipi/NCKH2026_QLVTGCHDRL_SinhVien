const exportsRepository = require('../data/repositories/exports.repository');
const GetOverviewUseCase = require('../business/services/GetOverviewUseCase');
const ExportActivitiesUseCase = require('../business/services/ExportActivitiesUseCase');
const ExportRegistrationsUseCase = require('../business/services/ExportRegistrationsUseCase');
const ExportsController = require('./controllers/ExportsController');

/**
 * Factory for creating ExportsController with all dependencies
 * Implements Dependency Injection pattern
 */
function createExportsController() {
  // Data layer
  const repo = exportsRepository;

  // Business layer (Use Cases)
  const useCases = {
    getOverview: new GetOverviewUseCase(repo),
    exportActivities: new ExportActivitiesUseCase(repo),
    exportRegistrations: new ExportRegistrationsUseCase(repo)
  };

  // Presentation layer
  const controller = new ExportsController(useCases);

  return controller;
}

module.exports = { createExportsController };

