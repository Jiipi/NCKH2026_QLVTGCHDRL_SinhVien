/**
 * BaseCrudUseCase - Generic use case with standard CRUD operations
 * Eliminates duplicate business logic across all use cases
 * 
 * @module core/base/BaseCrudUseCase
 * @example
 * ```typescript
 * class ActivityUseCase extends BaseCrudUseCase<Activity, CreateActivityDto, UpdateActivityDto> {
 *   constructor(repository: ActivityRepository) {
 *     super(repository, 'Hoạt động');
 *   }
 *   
 *   // Override for custom validation
 *   protected async validateCreate(dto: CreateActivityDto): Promise<void> {
 *     if (!dto.ten_hd) throw new ValidationError('Tên hoạt động là bắt buộc');
 *   }
 * }
 * ```
 */

import type { IRepository } from '../interfaces/IRepository';
import type { ICrudUseCase } from '../interfaces/IUseCase';
import type { UserContext, PaginatedResult, PaginationParams, FilterOptions } from '../types/common.types';

// Import JS modules with require for compatibility
const { AppError, NotFoundError, ForbiddenError, ValidationError } = require('../errors/AppError');

/**
 * Abstract Base CRUD Use Case
 * Provides standard CRUD operations with permission checks and validation hooks
 * 
 * @typeParam T - Entity type
 * @typeParam CreateDto - DTO for creating entities
 * @typeParam UpdateDto - DTO for updating entities
 */
export abstract class BaseCrudUseCase<T, CreateDto, UpdateDto>
  implements ICrudUseCase<T, CreateDto, UpdateDto> {

  /**
   * @param repository - Repository for data access
   * @param entityName - Human-readable entity name (for error messages)
   */
  constructor(
    protected readonly repository: IRepository<T, CreateDto, UpdateDto>,
    protected readonly entityName: string = 'Entity'
  ) {}

  /**
   * Get all entities with pagination
   */
  async getAll(
    filters: FilterOptions,
    pagination: PaginationParams,
    user: UserContext
  ): Promise<PaginatedResult<T>> {
    // Check read permission
    this.checkReadPermission(user);

    // Build where clause from filters
    const where = this.buildWhereClause(filters, user);

    return this.repository.findMany({
      where,
      pagination,
      orderBy: pagination.sortBy ? { [pagination.sortBy]: pagination.sortOrder || 'desc' } : undefined
    });
  }

  /**
   * Get entity by ID
   */
  async getById(id: string, user: UserContext): Promise<T> {
    // Check read permission
    this.checkReadPermission(user);

    const entity = await this.repository.findById(id);
    
    if (!entity) {
      throw new NotFoundError(`${this.entityName} không tồn tại`);
    }

    // Check if user can view this specific entity
    this.checkEntityAccess(entity, user, 'read');

    return entity;
  }

  /**
   * Create new entity
   */
  async create(dto: CreateDto, user: UserContext): Promise<T> {
    // Check create permission
    this.checkCreatePermission(user);

    // Validate input
    await this.validateCreate(dto, user);

    // Pre-process data
    const processedDto = await this.beforeCreate(dto, user);

    // Create entity
    const entity = await this.repository.create(processedDto);

    // Post-process
    await this.afterCreate(entity, user);

    return entity;
  }

  /**
   * Update entity
   */
  async update(id: string, dto: UpdateDto, user: UserContext): Promise<T> {
    // Check update permission
    this.checkUpdatePermission(user);

    // Get existing entity
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`${this.entityName} không tồn tại`);
    }

    // Check if user can update this specific entity
    this.checkEntityAccess(existing, user, 'update');

    // Validate input
    await this.validateUpdate(id, dto, existing, user);

    // Pre-process data
    const processedDto = await this.beforeUpdate(id, dto, existing, user);

    // Update entity
    const updated = await this.repository.update(id, processedDto);

    // Post-process
    await this.afterUpdate(updated, existing, user);

    return updated;
  }

  /**
   * Delete entity
   */
  async delete(id: string, user: UserContext): Promise<void> {
    // Check delete permission
    this.checkDeletePermission(user);

    // Get existing entity
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`${this.entityName} không tồn tại`);
    }

    // Check if user can delete this specific entity
    this.checkEntityAccess(existing, user, 'delete');

    // Validate deletion
    await this.validateDelete(id, existing, user);

    // Pre-delete hook
    await this.beforeDelete(existing, user);

    // Delete entity
    await this.repository.delete(id);

    // Post-delete hook
    await this.afterDelete(existing, user);
  }

  // ==================== PERMISSION HOOKS ====================
  // Override these in subclasses for custom permission logic

  /**
   * Check if user can read entities
   * @throws ForbiddenError if not allowed
   */
  protected checkReadPermission(user: UserContext): void {
    // Default: all authenticated users can read
    // Override in subclass for custom logic
  }

  /**
   * Check if user can create entities
   * @throws ForbiddenError if not allowed
   */
  protected checkCreatePermission(user: UserContext): void {
    // Default: all authenticated users can create
    // Override in subclass for custom logic
  }

  /**
   * Check if user can update entities
   * @throws ForbiddenError if not allowed
   */
  protected checkUpdatePermission(user: UserContext): void {
    // Default: all authenticated users can update
    // Override in subclass for custom logic
  }

  /**
   * Check if user can delete entities
   * @throws ForbiddenError if not allowed
   */
  protected checkDeletePermission(user: UserContext): void {
    // Default: only admin can delete
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError(`Bạn không có quyền xóa ${this.entityName}`);
    }
  }

  /**
   * Check if user can access a specific entity
   * @param entity - Entity to check
   * @param user - User context
   * @param action - Action being performed
   */
  protected checkEntityAccess(entity: T, user: UserContext, action: 'read' | 'update' | 'delete'): void {
    // Default: no restriction on specific entities
    // Override in subclass for entity-level access control
  }

  // ==================== VALIDATION HOOKS ====================
  // Override these in subclasses for custom validation

  /**
   * Validate create input
   * @throws ValidationError if invalid
   */
  protected async validateCreate(dto: CreateDto, user: UserContext): Promise<void> {
    // Override in subclass
  }

  /**
   * Validate update input
   * @throws ValidationError if invalid
   */
  protected async validateUpdate(
    id: string,
    dto: UpdateDto,
    existing: T,
    user: UserContext
  ): Promise<void> {
    // Override in subclass
  }

  /**
   * Validate deletion
   * @throws ValidationError if cannot delete
   */
  protected async validateDelete(id: string, existing: T, user: UserContext): Promise<void> {
    // Override in subclass
  }

  // ==================== LIFECYCLE HOOKS ====================
  // Override these in subclasses for custom processing

  /**
   * Pre-process create data
   * @returns Processed DTO
   */
  protected async beforeCreate(dto: CreateDto, user: UserContext): Promise<CreateDto> {
    return dto;
  }

  /**
   * Post-create hook
   */
  protected async afterCreate(entity: T, user: UserContext): Promise<void> {
    // Override in subclass for side effects (e.g., send notification)
  }

  /**
   * Pre-process update data
   * @returns Processed DTO
   */
  protected async beforeUpdate(
    id: string,
    dto: UpdateDto,
    existing: T,
    user: UserContext
  ): Promise<UpdateDto> {
    return dto;
  }

  /**
   * Post-update hook
   */
  protected async afterUpdate(updated: T, previous: T, user: UserContext): Promise<void> {
    // Override in subclass
  }

  /**
   * Pre-delete hook
   */
  protected async beforeDelete(entity: T, user: UserContext): Promise<void> {
    // Override in subclass
  }

  /**
   * Post-delete hook
   */
  protected async afterDelete(entity: T, user: UserContext): Promise<void> {
    // Override in subclass
  }

  // ==================== QUERY HELPERS ====================

  /**
   * Build where clause from filters
   * Override in subclass for custom filter logic
   */
  protected buildWhereClause(filters: FilterOptions, user: UserContext): Record<string, unknown> {
    // Remove undefined/null values
    const where: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        where[key] = value;
      }
    }

    return where;
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    return this.repository.exists({ id });
  }

  /**
   * Count entities with filters
   */
  async count(filters: FilterOptions, user: UserContext): Promise<number> {
    this.checkReadPermission(user);
    const where = this.buildWhereClause(filters, user);
    return this.repository.count(where);
  }
}

// For CommonJS compatibility
module.exports = { BaseCrudUseCase };
