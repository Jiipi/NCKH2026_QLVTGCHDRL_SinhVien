/**
 * Base Repository
 * Generic repository with common CRUD operations
 * All domain repositories should extend this class
 */

const { logError } = require('../../core/logger');
const { NotFoundError, InternalServerError } = require('../../core/errors/AppError');

class BaseRepository {
  /**
   * @param {object} prisma - Prisma client instance
   * @param {string} modelName - Name of the Prisma model (e.g., 'hoatDong', 'nguoiDung')
   */
  constructor(prisma, modelName) {
    this.prisma = prisma;
    this.modelName = modelName;
    this.model = prisma[modelName];

    if (!this.model) {
      throw new Error(`Prisma model "${modelName}" not found`);
    }
  }

  /**
   * Find all records with optional filters
   * @param {object} options - Query options
   * @param {object} options.where - Where clause
   * @param {object} options.select - Select fields
   * @param {object} options.include - Include relations
   * @param {object} options.orderBy - Order by
   * @param {number} options.skip - Skip records
   * @param {number} options.take - Take records
   * @returns {Promise<Array>}
   */
  async findMany(options = {}) {
    try {
      return await this.model.findMany(options);
    } catch (error) {
      logError(`${this.modelName}.findMany failed`, error);
      throw new InternalServerError(`Failed to fetch ${this.modelName} records`);
    }
  }

  /**
   * Find single record by unique criteria
   * @param {object} where - Where clause
   * @param {object} options - Additional options (select, include)
   * @returns {Promise<object|null>}
   */
  async findUnique(where, options = {}) {
    try {
      return await this.model.findUnique({
        where,
        ...options,
      });
    } catch (error) {
      logError(`${this.modelName}.findUnique failed`, error);
      throw new InternalServerError(`Failed to fetch ${this.modelName} record`);
    }
  }

  /**
   * Find first record matching criteria
   * @param {object} where - Where clause
   * @param {object} options - Additional options
   * @returns {Promise<object|null>}
   */
  async findFirst(where, options = {}) {
    try {
      return await this.model.findFirst({
        where,
        ...options,
      });
    } catch (error) {
      logError(`${this.modelName}.findFirst failed`, error);
      throw new InternalServerError(`Failed to fetch ${this.modelName} record`);
    }
  }

  /**
   * Find record by ID
   * @param {string} id - Record ID
   * @param {object} options - Additional options
   * @returns {Promise<object|null>}
   */
  async findById(id, options = {}) {
    return this.findUnique({ id }, options);
  }

  /**
   * Create new record
   * @param {object} data - Record data
   * @param {object} options - Additional options
   * @returns {Promise<object>}
   */
  async create(data, options = {}) {
    try {
      return await this.model.create({
        data,
        ...options,
      });
    } catch (error) {
      logError(`${this.modelName}.create failed`, error);
      throw error; // Let error mapper handle Prisma errors
    }
  }

  /**
   * Update record
   * @param {object} where - Where clause
   * @param {object} data - Update data
   * @param {object} options - Additional options
   * @returns {Promise<object>}
   */
  async update(where, data, options = {}) {
    try {
      return await this.model.update({
        where,
        data,
        ...options,
      });
    } catch (error) {
      logError(`${this.modelName}.update failed`, error);
      throw error;
    }
  }

  /**
   * Update by ID
   * @param {string} id - Record ID
   * @param {object} data - Update data
   * @param {object} options - Additional options
   * @returns {Promise<object>}
   */
  async updateById(id, data, options = {}) {
    return this.update({ id }, data, options);
  }

  /**
   * Delete record
   * @param {object} where - Where clause
   * @returns {Promise<object>}
   */
  async delete(where) {
    try {
      return await this.model.delete({ where });
    } catch (error) {
      logError(`${this.modelName}.delete failed`, error);
      throw error;
    }
  }

  /**
   * Delete by ID
   * @param {string} id - Record ID
   * @returns {Promise<object>}
   */
  async deleteById(id) {
    return this.delete({ id });
  }

  /**
   * Count records
   * @param {object} where - Where clause
   * @returns {Promise<number>}
   */
  async count(where = {}) {
    try {
      return await this.model.count({ where });
    } catch (error) {
      logError(`${this.modelName}.count failed`, error);
      throw new InternalServerError(`Failed to count ${this.modelName} records`);
    }
  }

  /**
   * Check if record exists
   * @param {object} where - Where clause
   * @returns {Promise<boolean>}
   */
  async exists(where) {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Find and count (useful for pagination)
   * @param {object} options - Query options
   * @returns {Promise<{items: Array, total: number}>}
   */
  async findAndCount(options = {}) {
    try {
      const [items, total] = await this.prisma.$transaction([
        this.model.findMany(options),
        this.model.count({ where: options.where }),
      ]);

      return { items, total };
    } catch (error) {
      logError(`${this.modelName}.findAndCount failed`, error);
      throw new InternalServerError(`Failed to fetch ${this.modelName} records`);
    }
  }

  /**
   * Upsert record (update or create)
   * @param {object} where - Unique where clause
   * @param {object} create - Data for create
   * @param {object} update - Data for update
   * @param {object} options - Additional options
   * @returns {Promise<object>}
   */
  async upsert(where, create, update, options = {}) {
    try {
      return await this.model.upsert({
        where,
        create,
        update,
        ...options,
      });
    } catch (error) {
      logError(`${this.modelName}.upsert failed`, error);
      throw error;
    }
  }

  /**
   * Batch create records
   * @param {Array} data - Array of records to create
   * @param {boolean} skipDuplicates - Skip duplicates on unique constraints
   * @returns {Promise<{count: number}>}
   */
  async createMany(data, skipDuplicates = false) {
    try {
      return await this.model.createMany({
        data,
        skipDuplicates,
      });
    } catch (error) {
      logError(`${this.modelName}.createMany failed`, error);
      throw error;
    }
  }

  /**
   * Batch update records
   * @param {object} where - Where clause
   * @param {object} data - Update data
   * @returns {Promise<{count: number}>}
   */
  async updateMany(where, data) {
    try {
      return await this.model.updateMany({
        where,
        data,
      });
    } catch (error) {
      logError(`${this.modelName}.updateMany failed`, error);
      throw error;
    }
  }

  /**
   * Batch delete records
   * @param {object} where - Where clause
   * @returns {Promise<{count: number}>}
   */
  async deleteMany(where) {
    try {
      return await this.model.deleteMany({ where });
    } catch (error) {
      logError(`${this.modelName}.deleteMany failed`, error);
      throw error;
    }
  }
}

module.exports = BaseRepository;




