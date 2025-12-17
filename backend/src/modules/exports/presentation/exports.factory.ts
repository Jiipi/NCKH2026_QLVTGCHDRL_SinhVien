/**
 * Factory for creating ExportsController with all dependencies
 * Implements Dependency Injection pattern
 */

import exportsRepository from '../data/repositories/exports.repository';
import GetOverviewUseCase from '../business/services/GetOverviewUseCase';
import ExportActivitiesUseCase from '../business/services/ExportActivitiesUseCase';
import ExportRegistrationsUseCase from '../business/services/ExportRegistrationsUseCase';
import ExportsController from './controllers/ExportsController';

function createExportsController(): ExportsController {
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

export { createExportsController };
module.exports = { createExportsController };
