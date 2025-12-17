/**
 * Test Base Classes
 * Verify all base classes work correctly
 */

import { BaseController } from './BaseController';
import { BaseRepository } from './BaseRepository';
import { BaseCrudUseCase } from './BaseCrudUseCase';
import { createPaginatedResult, PaginatedResult, PaginationParams } from '../types/common.types';
import { AppError, ValidationError, NotFoundError } from '../errors/AppError';
import { Response, Request } from 'express';

// ==================== MOCK TYPES ====================

interface MockResponse {
  statusCode: number;
  data: any;
  status(code: number): this;
  json(data: any): this;
}

interface MockPrismaModel {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  findFirst: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  count: jest.Mock;
  createMany: jest.Mock;
  updateMany: jest.Mock;
  deleteMany: jest.Mock;
  upsert: jest.Mock;
}

interface MockPrisma {
  testModel: MockPrismaModel;
}

interface TestEntity {
  id: string;
  name: string;
}

interface MockUser {
  id: string;
  role: string;
  permissions: string[];
}

// ==================== MOCK SETUP ====================

// Mock Express Response
const createMockRes = (): MockResponse => {
  const res: MockResponse = {
    statusCode: 200,
    data: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.data = data;
      return this;
    }
  };
  return res;
};

// Mock Prisma Client
const createMockPrisma = (data: TestEntity[] = []): MockPrisma => {
  return {
    testModel: {
      findMany: jest.fn().mockResolvedValue(data),
      findUnique: jest.fn().mockResolvedValue(data[0] || null),
      findFirst: jest.fn().mockResolvedValue(data[0] || null),
      create: jest.fn().mockImplementation((args: { data: any }) => Promise.resolve({ id: 'new-id', ...args.data })),
      update: jest.fn().mockImplementation((args: { where: { id: string }; data: any }) => Promise.resolve({ id: args.where.id, ...args.data })),
      delete: jest.fn().mockImplementation((args: { where: { id: string } }) => Promise.resolve({ id: args.where.id })),
      count: jest.fn().mockResolvedValue(data.length),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      upsert: jest.fn().mockImplementation((args: { create: any }) => Promise.resolve(args.create)),
    }
  };
};

// ==================== TEST: BaseController ====================

describe('BaseController', () => {
  class TestController extends BaseController {
    constructor() {
      super('TestController');
    }
  }

  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  test('should handle successful request', async () => {
    const res = createMockRes();
    const operation = (): Promise<{ message: string }> => Promise.resolve({ message: 'test data' });
    
    await controller.handleRequest(res as unknown as Response, operation, 'Success');
    
    expect(res.data.success).toBe(true);
    expect(res.data.data.message).toBe('test data');
    expect(res.data.message).toBe('Success');
  });

  test('should handle AppError correctly', async () => {
    const res = createMockRes();
    const operation = (): Promise<never> => Promise.reject(new AppError('Test error', 400));
    
    await controller.handleRequest(res as unknown as Response, operation, 'Success');
    
    expect(res.data.success).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.data.message).toBe('Test error');
  });

  test('should handle unknown error', async () => {
    const res = createMockRes();
    const operation = (): Promise<never> => Promise.reject(new Error('Unknown error'));
    
    await controller.handleRequest(res as unknown as Response, operation, 'Success');
    
    expect(res.data.success).toBe(false);
    expect(res.statusCode).toBe(500);
  });

  test('should extract user ID from request', () => {
    const req1 = { user: { sub: 'user-123' } } as unknown as Request;
    const req2 = { user: { id: 'user-456' } } as unknown as Request;
    const req3 = { user: { userId: 'user-789' } } as unknown as Request;
    const req4 = { user: {} } as unknown as Request;
    
    expect(controller.getUserId(req1)).toBe('user-123');
    expect(controller.getUserId(req2)).toBe('user-456');
    expect(controller.getUserId(req3)).toBe('user-789');
    expect(controller.getUserId(req4)).toBeNull();
  });

  test('should extract pagination params with defaults', () => {
    const query1 = {};
    const query2 = { page: '2', limit: '50', sortBy: 'name', sortOrder: 'asc' };
    const query3 = { page: '-1', limit: '500' };

    const params1 = controller.getPaginationParams(query1);
    expect(params1.page).toBe(1);
    expect(params1.limit).toBe(20);
    expect(params1.sortOrder).toBe('desc');

    const params2 = controller.getPaginationParams(query2);
    expect(params2.page).toBe(2);
    expect(params2.limit).toBe(50);
    expect(params2.sortBy).toBe('name');
    expect(params2.sortOrder).toBe('asc');

    const params3 = controller.getPaginationParams(query3);
    expect(params3.page).toBe(1); // Min 1
    expect(params3.limit).toBe(100); // Max 100
  });

  test('should extract filters excluding pagination keys', () => {
    const query = {
      page: '1',
      limit: '20',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'active',
      name: 'test',
      empty: ''
    };

    const filters = controller.getFilters(query);
    
    expect(filters).not.toHaveProperty('page');
    expect(filters).not.toHaveProperty('limit');
    expect(filters).not.toHaveProperty('sortBy');
    expect(filters).not.toHaveProperty('sortOrder');
    expect(filters).not.toHaveProperty('empty');
    expect(filters.status).toBe('active');
    expect(filters.name).toBe('test');
  });

  test('should require user ID and throw on missing', () => {
    const reqWithUser = { user: { sub: 'user-123' } } as unknown as Request;
    const reqWithoutUser = { user: {} } as unknown as Request;

    expect(controller.requireUserId(reqWithUser)).toBe('user-123');
    expect(() => controller.requireUserId(reqWithoutUser)).toThrow();
  });
});

// ==================== TEST: BaseRepository ====================

describe('BaseRepository', () => {
  class TestRepository extends BaseRepository<TestEntity> {
    constructor(prisma: any) {
      super(prisma, 'testModel');
    }

    get defaultInclude(): Record<string, boolean> {
      return { relation: true };
    }
  }

  const mockData: TestEntity[] = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' }
  ];

  let prisma: MockPrisma;
  let repository: TestRepository;

  beforeEach(() => {
    prisma = createMockPrisma(mockData);
    repository = new TestRepository(prisma);
  });

  test('should find many with pagination', async () => {
    const result = await repository.findMany({
      pagination: { page: 1, limit: 10 }
    });

    expect(result.items).toHaveLength(3);
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(false);
  });

  test('should find by ID', async () => {
    const result = await repository.findById('1');
    
    expect(result).toEqual(mockData[0]);
    expect(prisma.testModel.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: { relation: true }
    });
  });

  test('should create entity', async () => {
    const data = { name: 'New Item' };
    const result = await repository.create(data);

    expect(result.id).toBe('new-id');
    expect(result.name).toBe('New Item');
  });

  test('should update entity', async () => {
    const result = await repository.update('1', { name: 'Updated' });

    expect(result.id).toBe('1');
    expect(result.name).toBe('Updated');
  });

  test('should delete entity', async () => {
    const result = await repository.delete('1');

    expect(result.id).toBe('1');
    expect(prisma.testModel.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  test('should count entities', async () => {
    const count = await repository.count();
    expect(count).toBe(3);
  });

  test('should check if entity exists', async () => {
    prisma.testModel.count.mockResolvedValueOnce(1);
    const exists = await repository.exists({ id: '1' });
    expect(exists).toBe(true);

    prisma.testModel.count.mockResolvedValueOnce(0);
    const notExists = await repository.exists({ id: 'non-existent' });
    expect(notExists).toBe(false);
  });
});

// ==================== TEST: BaseCrudUseCase ====================

describe('BaseCrudUseCase', () => {
  // Mock repository
  const mockRepository = {
    findMany: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    exists: jest.fn()
  };

  class TestUseCase extends BaseCrudUseCase<TestEntity, Partial<TestEntity>, Partial<TestEntity>> {
    constructor() {
      super(mockRepository as any, 'TestEntity');
    }

    // Custom validation
    async validateCreate(dto: Partial<TestEntity>, user: MockUser): Promise<void> {
      if (!dto.name) {
        throw new ValidationError('Name is required');
      }
    }
  }

  let useCase: TestUseCase;
  const mockUser: MockUser = { id: 'user-1', role: 'ADMIN', permissions: [] };

  beforeEach(() => {
    useCase = new TestUseCase();
    jest.clearAllMocks();
  });

  test('should get all with pagination', async () => {
    const mockResult: PaginatedResult<TestEntity> = {
      items: [{ id: '1', name: 'Test' }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };
    mockRepository.findMany.mockResolvedValue(mockResult);

    const result = await useCase.getAll(
      { status: 'active' },
      { page: 1, limit: 20 },
      mockUser as any
    );

    expect(result.items).toHaveLength(1);
    expect(mockRepository.findMany).toHaveBeenCalled();
  });

  test('should get by ID', async () => {
    const mockEntity: TestEntity = { id: '1', name: 'Test' };
    mockRepository.findById.mockResolvedValue(mockEntity);

    const result = await useCase.getById('1', mockUser as any);

    expect(result).toEqual(mockEntity);
    expect(mockRepository.findById).toHaveBeenCalledWith('1');
  });

  test('should throw NotFoundError when entity not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.getById('non-existent', mockUser as any))
      .rejects.toThrow('TestEntity không tồn tại');
  });

  test('should create entity with validation', async () => {
    const dto: Partial<TestEntity> = { name: 'New Item' };
    const mockEntity: TestEntity = { id: 'new-id', ...dto as TestEntity };
    mockRepository.create.mockResolvedValue(mockEntity);

    const result = await useCase.create(dto, mockUser as any);

    expect(result).toEqual(mockEntity);
  });

  test('should fail validation on create', async () => {
    const dto: Partial<TestEntity> = {}; // Missing name

    await expect(useCase.create(dto, mockUser as any))
      .rejects.toThrow('Name is required');
  });

  test('should update entity', async () => {
    const existing: TestEntity = { id: '1', name: 'Old Name' };
    const updated: TestEntity = { id: '1', name: 'New Name' };
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.update.mockResolvedValue(updated);

    const result = await useCase.update('1', { name: 'New Name' }, mockUser as any);

    expect(result.name).toBe('New Name');
  });

  test('should delete entity (admin only by default)', async () => {
    const existing: TestEntity = { id: '1', name: 'Test' };
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.delete.mockResolvedValue(existing);

    await useCase.delete('1', mockUser as any);

    expect(mockRepository.delete).toHaveBeenCalledWith('1');
  });

  test('should deny delete for non-admin', async () => {
    const nonAdminUser: MockUser = { id: 'user-2', role: 'SINH_VIEN', permissions: [] };
    const existing: TestEntity = { id: '1', name: 'Test' };
    mockRepository.findById.mockResolvedValue(existing);

    await expect(useCase.delete('1', nonAdminUser as any))
      .rejects.toThrow('Bạn không có quyền xóa TestEntity');
  });
});

// ==================== TEST: Helper Functions ====================

describe('Helper Functions', () => {
  test('createPaginatedResult should calculate correctly', () => {
    const items = [1, 2, 3];
    const result = createPaginatedResult(items, 30, 2, 10);

    expect(result.items).toEqual([1, 2, 3]);
    expect(result.total).toBe(30);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(true);
  });

  test('createPaginatedResult edge cases', () => {
    // First page
    const first = createPaginatedResult([], 100, 1, 10);
    expect(first.hasPrev).toBe(false);
    expect(first.hasNext).toBe(true);

    // Last page
    const last = createPaginatedResult([], 100, 10, 10);
    expect(last.hasPrev).toBe(true);
    expect(last.hasNext).toBe(false);

    // Empty result
    const empty = createPaginatedResult([], 0, 1, 10);
    expect(empty.totalPages).toBe(0);
    expect(empty.hasNext).toBe(false);
    expect(empty.hasPrev).toBe(false);
  });
});

console.log('✅ All base class tests defined successfully!');
console.log('Run: npm test -- --testPathPattern=base.test.ts');
