# 🏗️ KẾ HOẠCH REFACTOR TOÀN DIỆN

## Mục tiêu: OOP + SOLID + Clean Code + TypeScript + MVC

**Ước tính giảm code: ~57% (~7000 lines)**

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### Code Duplicate Nghiêm Trọng:

| Layer | Duplicate Lines | Vấn đề |
|-------|----------------|--------|
| Backend Controllers | ~2000 lines | 20 controllers có cùng try-catch pattern |
| Backend Repositories | ~1500 lines | 26 repos có cùng CRUD methods |
| Backend UseCases | ~3000 lines | 148 files cùng pattern |
| Frontend Hooks | ~3000 lines | 65+ hooks cùng loading state |
| Frontend Services | ~2000 lines | 58 services cùng error handling |
| **TỔNG** | **~12,500 lines** | |

---

## 🏛️ KIẾN TRÚC MỚI

### Backend (Clean Architecture + TypeScript)

```
backend/src/
├── core/                           # Shared Infrastructure
│   ├── base/                       # 🆕 BASE CLASSES (DRY)
│   │   ├── BaseController.ts       # Abstract controller
│   │   ├── BaseRepository.ts       # Generic repository
│   │   ├── BaseCrudUseCase.ts      # CRUD operations
│   │   └── BaseValidator.ts        # Validation base
│   ├── decorators/                 # 🆕 DECORATORS
│   │   ├── @Authorize.ts           # Role-based auth
│   │   ├── @Validate.ts            # Input validation
│   │   ├── @CatchError.ts          # Error handling
│   │   └── @Transaction.ts         # DB transactions
│   ├── interfaces/                 # 🆕 CONTRACTS
│   │   ├── IRepository.ts          # Repository contract
│   │   ├── IUseCase.ts             # Use case contract
│   │   └── IController.ts          # Controller contract
│   ├── types/                      # 🆕 SHARED TYPES
│   │   ├── common.types.ts
│   │   ├── pagination.types.ts
│   │   ├── response.types.ts
│   │   └── database.types.ts
│   ├── errors/
│   ├── config/
│   ├── http/
│   └── utils/
│
├── modules/
│   └── [module-name]/              # Feature Module
│       ├── domain/                 # 🆕 DOMAIN LAYER
│       │   ├── entities/           # Business entities
│       │   ├── value-objects/      # Value objects
│       │   └── events/             # Domain events
│       ├── application/            # Use Cases (Business Logic)
│       │   ├── commands/           # Write operations
│       │   ├── queries/            # Read operations
│       │   └── dto/                # Data transfer objects
│       ├── infrastructure/         # Data Access
│       │   └── repositories/
│       └── presentation/           # API Layer
│           ├── controllers/
│           └── routes/
│
└── shared/                         # Cross-cutting concerns
    ├── events/
    ├── middleware/
    └── services/
```

### Frontend (Feature-Sliced Design + TypeScript)

```
frontend/src/
├── app/                            # App initialization
│   ├── providers/
│   ├── router/
│   └── store/
│
├── core/                           # 🆕 SHARED INFRASTRUCTURE
│   ├── api/                        # API Client
│   │   ├── BaseApi.ts              # Generic API class
│   │   ├── apiClient.ts            # Axios instance
│   │   ├── apiResponse.ts          # Response handling
│   │   └── endpoints.ts            # All endpoints
│   ├── hooks/                      # 🆕 BASE HOOKS
│   │   ├── useAsyncData.ts         # Generic data fetching
│   │   ├── useCrud.ts              # CRUD operations
│   │   ├── usePagination.ts        # Pagination logic
│   │   └── useForm.ts              # Form handling
│   ├── types/                      # 🆕 GLOBAL TYPES
│   │   ├── api.types.ts
│   │   ├── common.types.ts
│   │   └── entities/
│   └── utils/
│
├── features/                       # Feature Modules
│   └── [feature-name]/
│       ├── api/                    # Feature API (extends BaseApi)
│       ├── model/                  # Business logic
│       │   ├── hooks/              # Feature hooks (use core hooks)
│       │   ├── store/              # Feature state
│       │   └── types/              # Feature types
│       ├── ui/                     # UI Components
│       │   ├── components/
│       │   └── pages/
│       └── index.ts                # Public API
│
├── shared/                         # Shared UI
│   ├── components/
│   ├── layouts/
│   └── styles/
│
└── widgets/                        # Complex UI blocks
```

---

## 📅 TIMELINE: 8 TUẦN

### Phase 1: Core Infrastructure (Tuần 1-2)

#### Backend Core:
```typescript
// backend/src/core/base/BaseController.ts
import { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../http/response/apiResponse';
import { AppError } from '../errors/AppError';
import { logError } from '../logger';

export abstract class BaseController {
  /**
   * Wrap async operations with standard error handling
   */
  protected async handleRequest<T>(
    res: Response,
    operation: () => Promise<T>,
    successMessage: string,
    statusCode: number = 200
  ): Promise<Response> {
    try {
      const result = await operation();
      return sendResponse(res, statusCode, ApiResponse.success(result, successMessage));
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Standard error handling
   */
  protected handleError(res: Response, error: unknown): Response {
    logError('Controller error', error);

    if (error instanceof AppError) {
      return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
    }

    const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
    return sendResponse(res, 500, ApiResponse.error(message));
  }

  /**
   * Extract pagination params
   */
  protected getPaginationParams(query: any): PaginationParams {
    return {
      page: Math.max(1, parseInt(query.page, 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20)),
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc'
    };
  }
}
```

```typescript
// backend/src/core/base/BaseRepository.ts
import { PrismaClient } from '@prisma/client';
import { IRepository, FindManyOptions, PaginatedResult } from '../interfaces/IRepository';

export abstract class BaseRepository<T, CreateDto, UpdateDto> implements IRepository<T, CreateDto, UpdateDto> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly modelName: string
  ) {}

  protected get model() {
    return (this.prisma as any)[this.modelName];
  }

  async findMany(options: FindManyOptions = {}): Promise<PaginatedResult<T>> {
    const { where = {}, page = 1, limit = 20, orderBy, include } = options;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model.findMany({ where, skip, take: limit, orderBy, include }),
      this.model.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id: string, include?: object): Promise<T | null> {
    return this.model.findUnique({ where: { id }, include });
  }

  async findOne(where: object): Promise<T | null> {
    return this.model.findFirst({ where });
  }

  async create(data: CreateDto): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: UpdateDto): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  async count(where: object = {}): Promise<number> {
    return this.model.count({ where });
  }

  async exists(where: object): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }
}
```

```typescript
// backend/src/core/base/BaseCrudUseCase.ts
import { IRepository } from '../interfaces/IRepository';
import { NotFoundError, ForbiddenError, ValidationError } from '../errors/AppError';
import { UserContext } from '../types/common.types';

export abstract class BaseCrudUseCase<T, CreateDto, UpdateDto> {
  constructor(
    protected readonly repository: IRepository<T, CreateDto, UpdateDto>,
    protected readonly entityName: string
  ) {}

  async getAll(options: any, user: UserContext): Promise<PaginatedResult<T>> {
    this.checkReadPermission(user);
    return this.repository.findMany(options);
  }

  async getById(id: string, user: UserContext): Promise<T> {
    this.checkReadPermission(user);
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(`${this.entityName} không tồn tại`);
    }
    return entity;
  }

  async create(dto: CreateDto, user: UserContext): Promise<T> {
    this.checkCreatePermission(user);
    await this.validateCreate(dto);
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateDto, user: UserContext): Promise<T> {
    this.checkUpdatePermission(user);
    await this.validateUpdate(id, dto);
    return this.repository.update(id, dto);
  }

  async delete(id: string, user: UserContext): Promise<void> {
    this.checkDeletePermission(user);
    await this.validateDelete(id);
    await this.repository.delete(id);
  }

  // Override in subclasses for custom logic
  protected checkReadPermission(user: UserContext): void {}
  protected checkCreatePermission(user: UserContext): void {}
  protected checkUpdatePermission(user: UserContext): void {}
  protected checkDeletePermission(user: UserContext): void {}
  protected async validateCreate(dto: CreateDto): Promise<void> {}
  protected async validateUpdate(id: string, dto: UpdateDto): Promise<void> {}
  protected async validateDelete(id: string): Promise<void> {}
}
```

#### Frontend Core:
```typescript
// frontend/src/core/api/BaseApi.ts
import { apiClient, ApiResponse, extractData, handleApiError } from './apiClient';
import { PaginatedResponse, PaginationParams } from '../types/api.types';

export interface CrudEndpoints {
  list: string;
  detail: (id: string) => string;
  create: string;
  update: (id: string) => string;
  delete: (id: string) => string;
}

export abstract class BaseApi<
  Entity,
  CreateDto = Partial<Entity>,
  UpdateDto = Partial<Entity>
> {
  constructor(protected readonly endpoints: CrudEndpoints) {}

  async list(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Entity>>> {
    try {
      const response = await apiClient.get(this.endpoints.list, { params });
      return { success: true, data: extractData(response) };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getById(id: string): Promise<ApiResponse<Entity>> {
    try {
      const response = await apiClient.get(this.endpoints.detail(id));
      return { success: true, data: extractData(response) };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async create(data: CreateDto): Promise<ApiResponse<Entity>> {
    try {
      const response = await apiClient.post(this.endpoints.create, data);
      return { success: true, data: extractData(response) };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async update(id: string, data: UpdateDto): Promise<ApiResponse<Entity>> {
    try {
      const response = await apiClient.put(this.endpoints.update(id), data);
      return { success: true, data: extractData(response) };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(this.endpoints.delete(id));
      return { success: true, data: undefined };
    } catch (error) {
      return handleApiError(error);
    }
  }
}
```

```typescript
// frontend/src/core/hooks/useAsyncData.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiResponse } from '../api/apiClient';

interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncDataOptions<T> {
  initialData?: T | null;
  autoFetch?: boolean;
  cacheKey?: string;
}

export function useAsyncData<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  deps: React.DependencyList = [],
  options: UseAsyncDataOptions<T> = {}
) {
  const { initialData = null, autoFetch = true } = options;
  
  const [state, setState] = useState<AsyncDataState<T>>({
    data: initialData,
    loading: false,
    error: null
  });

  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await fetcher();
      
      if (!isMounted.current) return;
      
      if (result.success) {
        setState({ data: result.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: result.error || 'Unknown error' });
      }
    } catch (err) {
      if (!isMounted.current) return;
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      });
    }
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    if (autoFetch) {
      fetchData();
    }
    return () => { isMounted.current = false; };
  }, [fetchData, autoFetch]);

  return {
    ...state,
    reload: fetchData,
    setData: (data: T | null) => setState(prev => ({ ...prev, data }))
  };
}
```

```typescript
// frontend/src/core/hooks/useCrud.ts
import { useState, useCallback } from 'react';
import { BaseApi } from '../api/BaseApi';
import { useAsyncData } from './useAsyncData';

export function useCrud<T, CreateDto, UpdateDto>(
  api: BaseApi<T, CreateDto, UpdateDto>,
  options: { autoFetch?: boolean } = {}
) {
  const [submitting, setSubmitting] = useState(false);
  
  // List data with auto-fetch
  const { data, loading, error, reload, setData } = useAsyncData(
    () => api.list(),
    [],
    { autoFetch: options.autoFetch ?? true }
  );

  const create = useCallback(async (dto: CreateDto) => {
    setSubmitting(true);
    try {
      const result = await api.create(dto);
      if (result.success) {
        reload(); // Refresh list
      }
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [api, reload]);

  const update = useCallback(async (id: string, dto: UpdateDto) => {
    setSubmitting(true);
    try {
      const result = await api.update(id, dto);
      if (result.success) {
        reload();
      }
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [api, reload]);

  const remove = useCallback(async (id: string) => {
    setSubmitting(true);
    try {
      const result = await api.delete(id);
      if (result.success) {
        reload();
      }
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [api, reload]);

  return {
    // Data
    items: data?.items || [],
    total: data?.total || 0,
    pagination: data,
    
    // States
    loading,
    submitting,
    error,
    
    // Actions
    reload,
    create,
    update,
    remove
  };
}
```

---

### Phase 2: Core Types & Interfaces (Tuần 2)

```typescript
// backend/src/core/types/common.types.ts
export interface UserContext {
  id: string;
  role: 'ADMIN' | 'GIANG_VIEN' | 'LOP_TRUONG' | 'SINH_VIEN';
  permissions: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ID = string;
export type Timestamp = Date;
```

```typescript
// backend/src/core/interfaces/IRepository.ts
export interface IRepository<T, CreateDto, UpdateDto> {
  findMany(options?: FindManyOptions): Promise<PaginatedResult<T>>;
  findById(id: string): Promise<T | null>;
  findOne(where: object): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<T>;
  count(where?: object): Promise<number>;
  exists(where: object): Promise<boolean>;
}

export interface FindManyOptions {
  where?: object;
  page?: number;
  limit?: number;
  orderBy?: object;
  include?: object;
}
```

```typescript
// frontend/src/core/types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
```

---

### Phase 3: Migrate Modules (Tuần 3-5)

**Priority Order:**
1. `auth` - Core, nhiều modules phụ thuộc
2. `users` - Admin cần
3. `activities` - Feature chính
4. `registrations` - Liên quan activities
5. `dashboard` - Hiển thị tổng hợp
6. Các modules còn lại

**Example: Auth Module Migration:**

```typescript
// backend/src/modules/auth/domain/entities/User.ts
export interface User {
  id: string;
  ten_dn: string;
  mat_khau: string;
  email: string;
  ho_ten: string | null;
  vai_tro_id: string;
  trang_thai: TrangThaiTaiKhoan;
  anh_dai_dien: string | null;
  ngay_tao: Date;
  ngay_cap_nhat: Date;
  lan_cuoi_dn: Date | null;
  vai_tro?: VaiTro;
  sinh_vien?: SinhVien;
}

export enum TrangThaiTaiKhoan {
  HOAT_DONG = 'hoat_dong',
  BI_KHOA = 'bi_khoa',
  CHO_DUYET = 'cho_duyet'
}
```

```typescript
// backend/src/modules/auth/infrastructure/repositories/AuthRepository.ts
import { BaseRepository } from '../../../../core/base/BaseRepository';
import { User, CreateUserDto, UpdateUserDto } from '../../domain/entities/User';

export class AuthRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'nguoiDung');
  }

  // Additional methods specific to auth
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: this.defaultInclude
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.model.findFirst({
      where: { ten_dn: { equals: username, mode: 'insensitive' } },
      include: this.defaultInclude
    });
  }

  private get defaultInclude() {
    return {
      vai_tro: true,
      sinh_vien: { include: { lop: true } }
    };
  }
}
```

```typescript
// backend/src/modules/auth/application/commands/LoginCommand.ts
import { IHashService } from '../../../../core/interfaces/IHashService';
import { ITokenService } from '../../../../core/interfaces/ITokenService';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';
import { UnauthorizedError } from '../../../../core/errors/AppError';

export interface LoginDto {
  identifier: string; // username or email
  password: string;
}

export interface LoginResult {
  token: string;
  user: UserDto;
}

export class LoginCommand {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    // 1. Find user
    const user = await this.authRepository.findByUsername(dto.identifier)
      || await this.authRepository.findByEmail(dto.identifier);

    if (!user) {
      throw new UnauthorizedError('Tài khoản không tồn tại');
    }

    // 2. Verify password
    const isValid = await this.hashService.compare(dto.password, user.mat_khau);
    if (!isValid) {
      throw new UnauthorizedError('Mật khẩu không chính xác');
    }

    // 3. Generate token
    const token = this.tokenService.generate({
      sub: user.id,
      role: user.vai_tro?.ten_vt || 'SINH_VIEN'
    });

    // 4. Update login time
    await this.authRepository.update(user.id, { lan_cuoi_dn: new Date() });

    return {
      token,
      user: this.toUserDto(user)
    };
  }

  private toUserDto(user: User): UserDto {
    // ... mapping logic
  }
}
```

```typescript
// backend/src/modules/auth/presentation/controllers/AuthController.ts
import { Request, Response } from 'express';
import { BaseController } from '../../../../core/base/BaseController';
import { LoginCommand } from '../../application/commands/LoginCommand';
import { RegisterCommand } from '../../application/commands/RegisterCommand';

export class AuthController extends BaseController {
  constructor(
    private readonly loginCommand: LoginCommand,
    private readonly registerCommand: RegisterCommand
  ) {
    super();
  }

  login = async (req: Request, res: Response): Promise<Response> => {
    return this.handleRequest(
      res,
      () => this.loginCommand.execute(req.body),
      'Đăng nhập thành công'
    );
  };

  register = async (req: Request, res: Response): Promise<Response> => {
    return this.handleRequest(
      res,
      () => this.registerCommand.execute(req.body),
      'Đăng ký thành công',
      201
    );
  };
}
```

**Frontend Module Migration:**

```typescript
// frontend/src/features/auth/api/authApi.ts
import { BaseApi, CrudEndpoints } from '../../../core/api/BaseApi';
import { apiClient, ApiResponse, handleApiError, extractData } from '../../../core/api/apiClient';
import { User, LoginDto, RegisterDto, LoginResult } from '../model/types';

const endpoints: CrudEndpoints = {
  list: '/auth/users',
  detail: (id) => `/auth/users/${id}`,
  create: '/auth/register',
  update: (id) => `/auth/users/${id}`,
  delete: (id) => `/auth/users/${id}`
};

class AuthApi extends BaseApi<User, RegisterDto, Partial<User>> {
  constructor() {
    super(endpoints);
  }

  async login(dto: LoginDto): Promise<ApiResponse<LoginResult>> {
    try {
      const response = await apiClient.post('/auth/login', dto);
      return { success: true, data: extractData(response) };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      await apiClient.post('/auth/logout');
      return { success: true, data: undefined };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get('/auth/profile');
      return { success: true, data: extractData(response) };
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const authApi = new AuthApi();
```

```typescript
// frontend/src/features/auth/model/hooks/useAuth.ts
import { useCallback } from 'react';
import { useAsyncData } from '../../../../core/hooks/useAsyncData';
import { authApi } from '../../api/authApi';
import { useAppStore } from '../../../../app/store';
import { LoginDto } from '../types';

export function useAuth() {
  const { setAuth, clearAuth, token, user } = useAppStore();

  const { data: profile, loading, error, reload } = useAsyncData(
    () => authApi.getProfile(),
    [token],
    { autoFetch: !!token }
  );

  const login = useCallback(async (dto: LoginDto) => {
    const result = await authApi.login(dto);
    if (result.success && result.data) {
      setAuth({
        token: result.data.token,
        user: result.data.user
      });
    }
    return result;
  }, [setAuth]);

  const logout = useCallback(async () => {
    await authApi.logout();
    clearAuth();
  }, [clearAuth]);

  return {
    user: profile || user,
    isAuthenticated: !!token,
    loading,
    error,
    login,
    logout,
    refreshProfile: reload
  };
}
```

---

### Phase 4: Migrate Remaining Modules (Tuần 5-7)

**Each module follows the same pattern:**

1. **Create domain types** (entities, DTOs)
2. **Extend BaseRepository** with module-specific methods
3. **Create Commands/Queries** extending BaseCrudUseCase
4. **Extend BaseController** 
5. **Extend BaseApi** on frontend
6. **Use useAsyncData/useCrud hooks**

---

### Phase 5: Testing & Cleanup (Tuần 8)

- Remove old JS files
- Update imports
- Run type checking: `npx tsc --noEmit`
- Update tests
- Performance testing

---

## 📈 KẾT QUẢ DỰ KIẾN

### Giảm Code:

| Component | Before | After | Reduction |
|-----------|--------|-------|-----------|
| Backend Controllers | ~2000 LOC | ~800 LOC | **60%** |
| Backend Repositories | ~1500 LOC | ~600 LOC | **60%** |
| Backend UseCases | ~3000 LOC | ~1500 LOC | **50%** |
| Frontend Hooks | ~3000 LOC | ~1200 LOC | **60%** |
| Frontend Services | ~2000 LOC | ~800 LOC | **60%** |
| **TOTAL** | **~12,500** | **~5,400** | **~57%** |

### Số Files:

| Layer | Before | After | Change |
|-------|--------|-------|--------|
| Backend | 371 | ~200 + 50 types | -30% |
| Frontend | 657 | ~450 + 80 types | -20% |

### Lợi ích:

✅ **SOLID Principles:**
- **S**: Mỗi class 1 responsibility
- **O**: Extend base classes, không sửa
- **L**: Subclasses thay thế base
- **I**: Interface nhỏ, specific
- **D**: Depend on abstractions

✅ **Clean Code:**
- DRY - No duplicate
- KISS - Simple base classes
- YAGNI - Chỉ code cần thiết

✅ **Type Safety:**
- Compile-time errors
- Better IntelliSense
- Self-documenting

✅ **Maintainability:**
- Dễ thêm features
- Dễ fix bugs
- Dễ test

---

## 🔧 TOOLS & SCRIPTS

### Auto Migration Script:
```bash
# Install migration tools
npm install -D ts-migrate typescript @types/node

# Auto-convert JS to TS
npx ts-migrate migrate backend/src/modules/auth

# Type check
npx tsc --noEmit --incremental

# Find duplicate code
npx jscpd backend/src --min-lines 10 --reporters html
```

### CI/CD Integration:
```yaml
# .github/workflows/type-check.yml
name: Type Check
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
```

---

## 📋 CHECKLIST

### Phase 1 (Core):
- [ ] Create BaseController.ts
- [ ] Create BaseRepository.ts
- [ ] Create BaseCrudUseCase.ts
- [ ] Create BaseApi.ts
- [ ] Create useAsyncData.ts
- [ ] Create useCrud.ts
- [ ] Create shared types

### Phase 2 (Auth Module):
- [ ] Migrate auth domain
- [ ] Migrate auth repository
- [ ] Migrate auth commands
- [ ] Migrate auth controller
- [ ] Migrate auth frontend API
- [ ] Migrate auth hooks

### Phase 3-4 (Other Modules):
- [ ] activities
- [ ] registrations
- [ ] users
- [ ] dashboard
- [ ] classes
- [ ] teachers
- [ ] ...

### Phase 5 (Cleanup):
- [ ] Remove old .js files
- [ ] Update all imports
- [ ] Run type check
- [ ] Update tests
- [ ] Update documentation

---

**Bạn muốn tôi bắt đầu implement Phase 1 ngay bây giờ?**
