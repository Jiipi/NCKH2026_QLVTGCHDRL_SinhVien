/**
 * Factory for creating SearchController with all dependencies
 * Implements Dependency Injection pattern
 */

import searchRepository from '../data/repositories/search.repository';
import GlobalSearchUseCase from '../business/services/GlobalSearchUseCase';
import SearchController from './controllers/SearchController';

function createSearchController(): SearchController {
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

export { createSearchController };
module.exports = { createSearchController };
