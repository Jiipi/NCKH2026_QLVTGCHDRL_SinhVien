/**
 * UseCase Interfaces - Contract for business logic layer
 * @module core/interfaces/IUseCase
 */

import type { UserContext, PaginatedResult, PaginationParams, FilterOptions } from '../types/common.types';

/**
 * Basic Use Case Interface
 * Single method for executing business logic
 * 
 * @typeParam TInput - Input type
 * @typeParam TOutput - Output type
 */
export interface IUseCase<TInput, TOutput> {
  /**
   * Execute the use case
   * @param input - Input data
   * @param user - User context (optional)
   * @returns Output data
   */
  execute(input: TInput, user?: UserContext): Promise<TOutput>;
}

/**
 * CRUD Use Case Interface
 * Standard CRUD operations for entities
 * 
 * @typeParam T - Entity type
 * @typeParam CreateDto - DTO for creating
 * @typeParam UpdateDto - DTO for updating
 */
export interface ICrudUseCase<T, CreateDto, UpdateDto> {
  /**
   * Get all entities with pagination
   */
  getAll(
    filters: FilterOptions,
    pagination: PaginationParams,
    user: UserContext
  ): Promise<PaginatedResult<T>>;

  /**
   * Get entity by ID
   */
  getById(id: string, user: UserContext): Promise<T>;

  /**
   * Create new entity
   */
  create(dto: CreateDto, user: UserContext): Promise<T>;

  /**
   * Update entity
   */
  update(id: string, dto: UpdateDto, user: UserContext): Promise<T>;

  /**
   * Delete entity
   */
  delete(id: string, user: UserContext): Promise<void>;
}

/**
 * Query Use Case Interface
 * For read-only operations
 */
export interface IQueryUseCase<TQuery, TResult> {
  execute(query: TQuery, user?: UserContext): Promise<TResult>;
}

/**
 * Command Use Case Interface
 * For write operations
 */
export interface ICommandUseCase<TCommand, TResult = void> {
  execute(command: TCommand, user: UserContext): Promise<TResult>;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Use Case Result wrapper
 */
export interface UseCaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

/**
 * Helper to create success result
 */
export function successResult<T>(data: T): UseCaseResult<T> {
  return { success: true, data };
}

/**
 * Helper to create error result
 */
export function errorResult<T>(error: string, code?: number): UseCaseResult<T> {
  return { success: false, error, code };
}
