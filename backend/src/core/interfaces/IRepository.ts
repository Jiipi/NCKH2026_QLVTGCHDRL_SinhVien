/**
 * Repository Interface - Contract for data access layer
 * @module core/interfaces/IRepository
 */

import type { PaginatedResult, PaginationParams } from '../types/common.types';

/**
 * Options for findMany queries
 */
export interface FindManyOptions {
  /** Filter conditions */
  where?: Record<string, unknown>;
  /** Pagination settings */
  pagination?: PaginationParams;
  /** Sort settings */
  orderBy?: Record<string, 'asc' | 'desc'>;
  /** Relations to include */
  include?: Record<string, boolean | object>;
  /** Fields to select */
  select?: Record<string, boolean>;
}

/**
 * Options for findOne queries
 */
export interface FindOneOptions {
  /** Filter conditions */
  where: Record<string, unknown>;
  /** Relations to include */
  include?: Record<string, boolean | object>;
  /** Fields to select */
  select?: Record<string, boolean>;
}

/**
 * Generic Repository Interface
 * Defines standard CRUD operations for data access
 * 
 * @typeParam T - Entity type
 * @typeParam CreateDto - DTO for creating entities
 * @typeParam UpdateDto - DTO for updating entities
 */
export interface IRepository<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  /**
   * Find multiple entities with pagination
   * @param options - Query options
   * @returns Paginated result
   */
  findMany(options?: FindManyOptions): Promise<PaginatedResult<T>>;

  /**
   * Find all entities without pagination
   * @param options - Query options (without pagination)
   * @returns Array of entities
   */
  findAll(options?: Omit<FindManyOptions, 'pagination'>): Promise<T[]>;

  /**
   * Find entity by ID
   * @param id - Entity ID
   * @param include - Relations to include
   * @returns Entity or null if not found
   */
  findById(id: string, include?: Record<string, boolean | object>): Promise<T | null>;

  /**
   * Find single entity by conditions
   * @param options - Query options
   * @returns Entity or null if not found
   */
  findOne(options: FindOneOptions): Promise<T | null>;

  /**
   * Create new entity
   * @param data - Entity data
   * @returns Created entity
   */
  create(data: CreateDto): Promise<T>;

  /**
   * Create multiple entities
   * @param data - Array of entity data
   * @returns Number of created entities
   */
  createMany(data: CreateDto[]): Promise<number>;

  /**
   * Update entity by ID
   * @param id - Entity ID
   * @param data - Update data
   * @returns Updated entity
   */
  update(id: string, data: UpdateDto): Promise<T>;

  /**
   * Update multiple entities
   * @param where - Filter conditions
   * @param data - Update data
   * @returns Number of updated entities
   */
  updateMany(where: Record<string, unknown>, data: UpdateDto): Promise<number>;

  /**
   * Delete entity by ID
   * @param id - Entity ID
   * @returns Deleted entity
   */
  delete(id: string): Promise<T>;

  /**
   * Delete multiple entities
   * @param where - Filter conditions
   * @returns Number of deleted entities
   */
  deleteMany(where: Record<string, unknown>): Promise<number>;

  /**
   * Count entities
   * @param where - Filter conditions
   * @returns Count of matching entities
   */
  count(where?: Record<string, unknown>): Promise<number>;

  /**
   * Check if entity exists
   * @param where - Filter conditions
   * @returns True if exists
   */
  exists(where: Record<string, unknown>): Promise<boolean>;
}

/**
 * Read-only repository interface
 */
export interface IReadOnlyRepository<T> {
  findMany(options?: FindManyOptions): Promise<PaginatedResult<T>>;
  findAll(options?: Omit<FindManyOptions, 'pagination'>): Promise<T[]>;
  findById(id: string, include?: Record<string, boolean | object>): Promise<T | null>;
  findOne(options: FindOneOptions): Promise<T | null>;
  count(where?: Record<string, unknown>): Promise<number>;
  exists(where: Record<string, unknown>): Promise<boolean>;
}
