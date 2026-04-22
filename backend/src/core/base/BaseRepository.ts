/**
 * BaseRepository - Generic repository with standard CRUD operations
 * Eliminates duplicate Prisma queries across all repositories
 * 
 * @module core/base/BaseRepository
 * @example
 * ```typescript
 * class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
 *   constructor(prisma: PrismaClient) {
 *     super(prisma, 'nguoiDung');
 *   }
 *   
 *   // Add custom methods here
 *   async findByEmail(email: string) {
 *     return this.model.findFirst({ where: { email } });
 *   }
 * }
 * ```
 */

import type { PrismaClient } from '@prisma/client';
import type { IRepository, FindManyOptions, FindOneOptions } from '../interfaces/IRepository';
import type { PaginatedResult } from '../types/common.types';
import { createPaginatedResult } from '../types/common.types';

interface PrismaModelDelegate {
  findMany(args?: unknown): Promise<unknown[]>;
  count(args?: unknown): Promise<number>;
  findUnique(args: unknown): Promise<unknown | null>;
  findFirst(args: unknown): Promise<unknown | null>;
  create(args: unknown): Promise<unknown>;
  createMany(args: unknown): Promise<{ count: number }>;
  update(args: unknown): Promise<unknown>;
  updateMany(args: unknown): Promise<{ count: number }>;
  delete(args: unknown): Promise<unknown>;
  deleteMany(args: unknown): Promise<{ count: number }>;
  upsert(args: unknown): Promise<unknown>;
}

/**
 * Abstract Base Repository
 * Provides standard CRUD operations using Prisma
 * 
 * @typeParam T - Entity type
 * @typeParam CreateDto - DTO for creating entities
 * @typeParam UpdateDto - DTO for updating entities
 */
export abstract class BaseRepository<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> 
  implements IRepository<T, CreateDto, UpdateDto> {

  /**
   * @param prisma - Prisma client instance
   * @param modelName - Name of the Prisma model (must match schema)
   */
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly modelName: string
  ) {}

  /**
   * Get the Prisma model delegate
   * Uses dynamic access for flexibility
   */
  protected get model(): PrismaModelDelegate {
    const delegates = this.prisma as unknown as Record<string, unknown>;
    return delegates[this.modelName] as PrismaModelDelegate;
  }

  /**
   * Default include relations (override in subclass)
   */
  protected get defaultInclude(): Record<string, boolean | object> | undefined {
    return undefined;
  }

  /**
   * Find multiple entities with pagination
   */
  async findMany(options: FindManyOptions = {}): Promise<PaginatedResult<T>> {
    const { 
      where = {}, 
      pagination = { page: 1, limit: 20 },
      orderBy,
      include = this.defaultInclude,
      select
    } = options;

    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;
    
    // Build orderBy from pagination or use provided
    const finalOrderBy = orderBy || (sortBy ? { [sortBy]: sortOrder || 'desc' } : undefined);

    // Execute count and find in parallel
    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: finalOrderBy,
        ...(include && { include }),
        ...(select && { select })
      }),
      this.model.count({ where })
    ]);

    return createPaginatedResult(items as T[], total, page, limit);
  }

  /**
   * Find all entities without pagination
   */
  async findAll(options: Omit<FindManyOptions, 'pagination'> = {}): Promise<T[]> {
    const { 
      where = {}, 
      orderBy,
      include = this.defaultInclude,
      select
    } = options;

    return this.model.findMany({
      where,
      orderBy,
      ...(include && { include }),
      ...(select && { select })
    }) as Promise<T[]>;
  }

  /**
   * Find entity by ID
   */
  async findById(id: string, include?: Record<string, boolean | object>): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include: include || this.defaultInclude
    }) as Promise<T | null>;
  }

  /**
   * Find single entity by conditions
   */
  async findOne(options: FindOneOptions): Promise<T | null> {
    const { where, include = this.defaultInclude, select } = options;
    
    return this.model.findFirst({
      where,
      ...(include && { include }),
      ...(select && { select })
    }) as Promise<T | null>;
  }

  /**
   * Create new entity
   */
  async create(data: CreateDto): Promise<T> {
    return this.model.create({
      data,
      include: this.defaultInclude
    }) as Promise<T>;
  }

  /**
   * Create multiple entities
   */
  async createMany(data: CreateDto[]): Promise<number> {
    const result = await this.model.createMany({
      data,
      skipDuplicates: true
    });
    return result.count;
  }

  /**
   * Update entity by ID
   */
  async update(id: string, data: UpdateDto): Promise<T> {
    return this.model.update({
      where: { id },
      data,
      include: this.defaultInclude
    }) as Promise<T>;
  }

  /**
   * Update multiple entities
   */
  async updateMany(where: Record<string, unknown>, data: UpdateDto): Promise<number> {
    const result = await this.model.updateMany({ where, data });
    return result.count;
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } }) as Promise<T>;
  }

  /**
   * Delete multiple entities
   */
  async deleteMany(where: Record<string, unknown>): Promise<number> {
    const result = await this.model.deleteMany({ where });
    return result.count;
  }

  /**
   * Count entities
   */
  async count(where: Record<string, unknown> = {}): Promise<number> {
    return this.model.count({ where });
  }

  /**
   * Check if entity exists
   */
  async exists(where: Record<string, unknown>): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Find entity by ID or throw error
   * Useful for operations that require the entity to exist
   */
  async findByIdOrThrow(id: string, include?: Record<string, boolean | object>): Promise<T> {
    const entity = await this.findById(id, include);
    if (!entity) {
      throw new Error(`${this.modelName} với ID ${id} không tồn tại`);
    }
    return entity;
  }

  /**
   * Upsert (create or update) entity
   */
  async upsert(
    where: Record<string, unknown>,
    create: CreateDto,
    update: UpdateDto
  ): Promise<T> {
    return this.model.upsert({
      where,
      create,
      update,
      include: this.defaultInclude
    }) as Promise<T>;
  }

  /**
   * Execute raw query (use sparingly)
   */
  async raw<R>(query: string, params: unknown[] = []): Promise<R> {
    return this.prisma.$queryRawUnsafe(query, ...params) as Promise<R>;
  }

  /**
   * Execute in transaction
   */
  async transaction<R>(fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(fn);
  }
}

// For CommonJS compatibility
module.exports = { BaseRepository };
