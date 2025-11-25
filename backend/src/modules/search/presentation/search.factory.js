const searchRepository = require('../data/repositories/search.repository');
const GlobalSearchUseCase = require('../business/services/GlobalSearchUseCase');
const SearchController = require('./controllers/SearchController');

/**
 * Factory for creating SearchController with all dependencies
 * Implements Dependency Injection pattern
 */
function createSearchController() {
  // Data layer
  const repo = searchRepository;

  // Business layer (Use Cases)
  const useCases = {
    globalSearch: new GlobalSearchUseCase(repo)
  };

  // Presentation layer
  const controller = new SearchController(useCases);

  return controller;
}

module.exports = { createSearchController };

