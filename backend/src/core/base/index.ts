/**
 * Base Classes Index
 * Export all base classes for use across the application
 * 
 * @module core/base
 */

// Export TypeScript classes
export { BaseController } from './BaseController';
export { BaseRepository } from './BaseRepository';
export { BaseCrudUseCase } from './BaseCrudUseCase';

// Re-export types
export type { 
  UserContext, 
  PaginationParams, 
  PaginatedResult,
  AuthenticatedRequest,
  FilterOptions,
  ID,
  Timestamp
} from '../types/common.types';

export type {
  IRepository,
  FindManyOptions,
  FindOneOptions,
  IReadOnlyRepository
} from '../interfaces/IRepository';

export type {
  IUseCase,
  ICrudUseCase,
  IQueryUseCase,
  ICommandUseCase,
  ValidationResult,
  UseCaseResult
} from '../interfaces/IUseCase';

// Helper functions
export { 
  extractUserId, 
  createPaginationParams, 
  createPaginatedResult 
} from '../types/common.types';

export { 
  successResult, 
  errorResult 
} from '../interfaces/IUseCase';
