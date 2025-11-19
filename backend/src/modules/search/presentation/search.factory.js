const SearchPrismaRepository = require('../infrastructure/repositories/SearchPrismaRepository');
const GlobalSearchUseCase = require('../application/use-cases/GlobalSearchUseCase');
const SearchController = require('./SearchController');

/**
 * Factory for creating SearchController with all dependencies
 * Implements Dependency Injection pattern
 */
function createSearchController() {
  // Infrastructure layer
  const searchRepository = new SearchPrismaRepository();

  // Application layer (Use Cases)
  const useCases = {
    globalSearch: new GlobalSearchUseCase(searchRepository)
  };

  // Presentation layer
  const controller = new SearchController(useCases);

  return controller;
}

module.exports = { createSearchController };

