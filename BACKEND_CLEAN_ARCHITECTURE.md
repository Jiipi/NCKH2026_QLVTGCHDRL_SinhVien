# Backend Clean Architecture - Cấu Trúc Chi Tiết
## Tuân Thủ SOLID Principles & Clean Code

> **Dự án:** Hệ thống Quản lý Hoạt động Rèn Luyện  
> **Kiến trúc:** Layered Architecture + Clean Architecture  
> **Ngôn ngữ:** Node.js + Express + Prisma  
> **Mục tiêu:** Dễ bảo trì, dễ mở rộng, dễ test, tuân thủ 100% SOLID

---

## 📐 Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────┐
│   Presentation Layer (Controllers)      │ ← HTTP Request/Response
├─────────────────────────────────────────┤
│   Application Layer (Use Cases)         │ ← Business Logic
├─────────────────────────────────────────┤
│   Domain Layer (Entities & Interfaces)  │ ← Core Business Rules
├─────────────────────────────────────────┤
│   Infrastructure Layer (Implementations) │ ← Database, External APIs
└─────────────────────────────────────────┘
```

### Dependency Flow
```
Presentation → Application → Domain ← Infrastructure
     ↓              ↓            ↑          ↑
  Routes      Use Cases    Interfaces   Implementations
```

---

## 🗂️ Cấu Trúc Thư Mục Đề Xuất (Tuân Thủ Clean Architecture)

```
backend/
├── src/
│   ├── domain/                          # DOMAIN LAYER (Core)
│   │   ├── entities/                    # Business Entities (Pure Objects)
│   │   │   ├── User.entity.js
│   │   │   ├── Activity.entity.js
│   │   │   ├── Registration.entity.js
│   │   │   ├── Semester.entity.js
│   │   │   ├── Class.entity.js
│   │   │   └── Role.entity.js
│   │   │
│   │   ├── value-objects/              # Value Objects (Immutable)
│   │   │   ├── Email.vo.js
│   │   │   ├── Password.vo.js
│   │   │   ├── StudentId.vo.js
│   │   │   └── DateRange.vo.js
│   │   │
│   │   └── interfaces/                 # Contracts (Abstractions)
│   │       ├── repositories/
│   │       │   ├── IUserRepository.js
│   │       │   ├── IActivityRepository.js
│   │       │   ├── IRegistrationRepository.js
│   │       │   └── ISemesterRepository.js
│   │       │
│   │       └── services/
│   │           ├── IHashService.js
│   │           ├── IEmailService.js
│   │           ├── ITokenService.js
│   │           └── IStorageService.js
│   │
│   ├── application/                     # APPLICATION LAYER (Use Cases)
│   │   ├── use-cases/                   # Business Logic (Commands/Queries)
│   │   │   ├── auth/
│   │   │   │   ├── LoginUseCase.js
│   │   │   │   ├── RegisterUseCase.js
│   │   │   │   ├── RefreshTokenUseCase.js
│   │   │   │   └── LogoutUseCase.js
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── CreateUserUseCase.js
│   │   │   │   ├── GetUserUseCase.js
│   │   │   │   ├── UpdateUserUseCase.js
│   │   │   │   ├── DeleteUserUseCase.js
│   │   │   │   └── GetUsersByRoleUseCase.js
│   │   │   │
│   │   │   ├── activities/
│   │   │   │   ├── CreateActivityUseCase.js
│   │   │   │   ├── ApproveActivityUseCase.js
│   │   │   │   ├── RejectActivityUseCase.js
│   │   │   │   ├── GetActivitiesUseCase.js
│   │   │   │   └── DeleteActivityUseCase.js
│   │   │   │
│   │   │   ├── registrations/
│   │   │   │   ├── RegisterForActivityUseCase.js
│   │   │   │   ├── CancelRegistrationUseCase.js
│   │   │   │   ├── ApproveRegistrationUseCase.js
│   │   │   │   └── GetMyRegistrationsUseCase.js
│   │   │   │
│   │   │   ├── permissions/
│   │   │   │   ├── GetUserPermissionsUseCase.js
│   │   │   │   ├── UpdateRolePermissionsUseCase.js
│   │   │   │   └── CheckPermissionUseCase.js
│   │   │   │
│   │   │   └── semesters/
│   │   │       ├── CreateSemesterUseCase.js
│   │   │       ├── ActivateSemesterUseCase.js
│   │   │       ├── LockSemesterUseCase.js
│   │   │       └── GetCurrentSemesterUseCase.js
│   │   │
│   │   ├── dto/                         # Data Transfer Objects
│   │   │   ├── auth/
│   │   │   │   ├── LoginDto.js
│   │   │   │   └── RegisterDto.js
│   │   │   ├── users/
│   │   │   │   ├── CreateUserDto.js
│   │   │   │   └── UpdateUserDto.js
│   │   │   └── activities/
│   │   │       ├── CreateActivityDto.js
│   │   │       └── UpdateActivityDto.js
│   │   │
│   │   ├── mappers/                     # Entity ↔ DTO Mapping
│   │   │   ├── UserMapper.js
│   │   │   ├── ActivityMapper.js
│   │   │   └── RegistrationMapper.js
│   │   │
│   │   └── validators/                  # Business Validation Rules
│   │       ├── UserValidator.js
│   │       ├── ActivityValidator.js
│   │       └── RegistrationValidator.js
│   │
│   ├── infrastructure/                  # INFRASTRUCTURE LAYER
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   └── migrations/
│   │   │   │
│   │   │   └── repositories/           # Repository Implementations
│   │   │       ├── PrismaUserRepository.js
│   │   │       ├── PrismaActivityRepository.js
│   │   │       ├── PrismaRegistrationRepository.js
│   │   │       ├── PrismaSemesterRepository.js
│   │   │       └── BaseRepository.js
│   │   │
│   │   ├── services/                    # External Services Implementations
│   │   │   ├── BcryptHashService.js
│   │   │   ├── NodeMailerEmailService.js
│   │   │   ├── JwtTokenService.js
│   │   │   ├── LocalStorageService.js
│   │   │   └── CloudinaryStorageService.js
│   │   │
│   │   ├── http/                        # HTTP Clients
│   │   │   └── AxiosClient.js
│   │   │
│   │   └── cache/                       # Caching Layer
│   │       ├── RedisCache.js
│   │       └── MemoryCache.js
│   │
│   ├── presentation/                    # PRESENTATION LAYER
│   │   ├── http/
│   │   │   ├── controllers/            # HTTP Controllers
│   │   │   │   ├── AuthController.js
│   │   │   │   ├── UsersController.js
│   │   │   │   ├── ActivitiesController.js
│   │   │   │   ├── RegistrationsController.js
│   │   │   │   ├── PermissionsController.js
│   │   │   │   └── SemestersController.js
│   │   │   │
│   │   │   ├── routes/                 # Route Definitions
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── users.routes.js
│   │   │   │   ├── activities.routes.js
│   │   │   │   ├── registrations.routes.js
│   │   │   │   ├── permissions.routes.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── middleware/             # HTTP Middleware
│   │   │   │   ├── auth/
│   │   │   │   │   ├── authenticate.js
│   │   │   │   │   ├── authorize.js
│   │   │   │   │   └── dynamicPermission.js
│   │   │   │   │
│   │   │   │   ├── validation/
│   │   │   │   │   ├── validateRequest.js
│   │   │   │   │   └── sanitizeInput.js
│   │   │   │   │
│   │   │   │   ├── security/
│   │   │   │   │   ├── cors.js
│   │   │   │   │   ├── helmet.js
│   │   │   │   │   └── rateLimiter.js
│   │   │   │   │
│   │   │   │   ├── logging/
│   │   │   │   │   ├── requestLogger.js
│   │   │   │   │   └── sessionTracker.js
│   │   │   │   │
│   │   │   │   └── error/
│   │   │   │       ├── errorHandler.js
│   │   │   │       └── notFoundHandler.js
│   │   │   │
│   │   │   └── presenters/             # Response Formatters
│   │   │       ├── ApiPresenter.js
│   │   │       ├── PaginationPresenter.js
│   │   │       └── ErrorPresenter.js
│   │   │
│   │   └── websocket/                   # WebSocket Handlers (Optional)
│   │       └── NotificationHandler.js
│   │
│   ├── shared/                          # SHARED UTILITIES
│   │   ├── errors/                      # Custom Errors
│   │   │   ├── AppError.js
│   │   │   ├── ValidationError.js
│   │   │   ├── NotFoundError.js
│   │   │   ├── UnauthorizedError.js
│   │   │   └── ForbiddenError.js
│   │   │
│   │   ├── logger/                      # Logging
│   │   │   └── WinstonLogger.js
│   │   │
│   │   ├── utils/                       # Helper Functions
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── dateHelpers.js
│   │   │   └── stringHelpers.js
│   │   │
│   │   └── constants/                   # Constants
│   │       ├── roles.js
│   │       ├── permissions.js
│   │       ├── statuses.js
│   │       └── errorCodes.js
│   │
│   ├── config/                          # CONFIGURATION
│   │   ├── database.js
│   │   ├── server.js
│   │   ├── jwt.js
│   │   ├── email.js
│   │   └── env.js
│   │
│   ├── di/                              # DEPENDENCY INJECTION
│   │   ├── container.js                 # IoC Container
│   │   └── bindings/                    # DI Bindings
│   │       ├── repositories.js
│   │       ├── services.js
│   │       ├── useCases.js
│   │       └── controllers.js
│   │
│   ├── jobs/                            # BACKGROUND JOBS
│   │   ├── CleanupSessionsJob.js
│   │   ├── SendEmailJob.js
│   │   └── CalculatePointsJob.js
│   │
│   ├── app.js                           # Express App Setup
│   └── server.js                        # Server Entry Point
│
├── tests/                               # TESTS
│   ├── unit/                            # Unit Tests
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   │
│   ├── integration/                     # Integration Tests
│   │   └── api/
│   │
│   └── e2e/                             # End-to-End Tests
│       └── scenarios/
│
├── .env.example
├── .env.development
├── .env.production
├── package.json
├── jest.config.js
└── README.md
```

---

## 🎯 SOLID Principles Implementation

### 1. Single Responsibility Principle (SRP)

**✅ Mỗi class chỉ có 1 trách nhiệm duy nhất**

#### ❌ Vi phạm SRP:
```javascript
// BAD: Controller làm quá nhiều việc
class UserController {
  async createUser(req, res) {
    // Validation
    if (!req.body.email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    
    // Business logic
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // Database
    const user = await prisma.nguoiDung.create({
      data: { email: req.body.email, password: hashedPassword }
    });
    
    // Email sending
    await sendEmail(user.email, 'Welcome!');
    
    // Response
    res.json(user);
  }
}
```

#### ✅ Tuân thủ SRP:
```javascript
// GOOD: Mỗi class một trách nhiệm

// 1. DTO - Validate và transform input
class CreateUserDto {
  constructor(email, password, name) {
    this.email = email;
    this.password = password;
    this.name = name;
  }
  
  static fromRequest(body) {
    if (!body.email?.includes('@')) {
      throw new ValidationError('Invalid email');
    }
    if (!body.password || body.password.length < 8) {
      throw new ValidationError('Password too short');
    }
    return new CreateUserDto(
      body.email.toLowerCase().trim(),
      body.password,
      body.name.trim()
    );
  }
}

// 2. Entity - Business rules và data
class User {
  constructor(id, email, passwordHash, name, createdAt) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.name = name;
    this.createdAt = createdAt;
  }
  
  static create(email, passwordHash, name) {
    return new User(
      generateId(),
      email,
      passwordHash,
      name,
      new Date()
    );
  }
}

// 3. Repository - Data access ONLY
class PrismaUserRepository {
  async save(user) {
    await prisma.nguoiDung.create({
      data: {
        id: user.id,
        email: user.email,
        mat_khau: user.passwordHash,
        ho_ten: user.name,
        ngay_tao: user.createdAt
      }
    });
  }
  
  async findByEmail(email) {
    const data = await prisma.nguoiDung.findUnique({ where: { email } });
    if (!data) return null;
    return this.toDomain(data);
  }
  
  toDomain(raw) {
    return new User(raw.id, raw.email, raw.mat_khau, raw.ho_ten, raw.ngay_tao);
  }
}

// 4. Service - Hash password ONLY
class BcryptHashService {
  async hash(plainText) {
    return bcrypt.hash(plainText, 10);
  }
  
  async compare(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  }
}

// 5. Use Case - Orchestrate business logic
class CreateUserUseCase {
  constructor(userRepository, hashService, emailService) {
    this.userRepository = userRepository;
    this.hashService = hashService;
    this.emailService = emailService;
  }
  
  async execute(dto) {
    // Check exists
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('User already exists');
    }
    
    // Hash password
    const passwordHash = await this.hashService.hash(dto.password);
    
    // Create entity
    const user = User.create(dto.email, passwordHash, dto.name);
    
    // Save
    await this.userRepository.save(user);
    
    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);
    
    return { userId: user.id };
  }
}

// 6. Controller - HTTP handling ONLY
class UserController {
  constructor(createUserUseCase) {
    this.createUserUseCase = createUserUseCase;
  }
  
  async create(req, res, next) {
    try {
      const dto = CreateUserDto.fromRequest(req.body);
      const result = await this.createUserUseCase.execute(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
```

---

### 2. Open/Closed Principle (OCP)

**✅ Mở để mở rộng, đóng để sửa đổi**

#### ❌ Vi phạm OCP:
```javascript
// BAD: Phải sửa code mỗi khi thêm auth method mới
class AuthService {
  async authenticate(credentials) {
    if (credentials.type === 'jwt') {
      // JWT logic
      return this.authenticateJwt(credentials);
    } else if (credentials.type === 'oauth') {
      // OAuth logic
      return this.authenticateOAuth(credentials);
    } else if (credentials.type === 'saml') {
      // SAML logic - PHẢI SỬA CODE
      return this.authenticateSAML(credentials);
    }
  }
}
```

#### ✅ Tuân thủ OCP:
```javascript
// GOOD: Interface cho auth strategies

// Interface (Contract)
class IAuthStrategy {
  async authenticate(credentials) {
    throw new Error('Must implement authenticate()');
  }
}

// JWT Strategy
class JwtAuthStrategy extends IAuthStrategy {
  constructor(jwtService) {
    super();
    this.jwtService = jwtService;
  }
  
  async authenticate(credentials) {
    const token = credentials.token;
    const payload = await this.jwtService.verify(token);
    return { userId: payload.sub, role: payload.role };
  }
}

// OAuth Strategy
class OAuthStrategy extends IAuthStrategy {
  constructor(oauthClient) {
    super();
    this.oauthClient = oauthClient;
  }
  
  async authenticate(credentials) {
    const token = credentials.accessToken;
    const userInfo = await this.oauthClient.getUserInfo(token);
    return { userId: userInfo.id, role: userInfo.role };
  }
}

// SAML Strategy - THÊM MỚI mà KHÔNG SỬA CODE CŨ
class SAMLStrategy extends IAuthStrategy {
  constructor(samlClient) {
    super();
    this.samlClient = samlClient;
  }
  
  async authenticate(credentials) {
    const assertion = credentials.samlAssertion;
    const user = await this.samlClient.validateAssertion(assertion);
    return { userId: user.id, role: user.role };
  }
}

// Auth Service - không cần sửa khi thêm strategy mới
class AuthService {
  constructor(strategies = {}) {
    this.strategies = strategies; // { jwt: JwtStrategy, oauth: OAuthStrategy }
  }
  
  async authenticate(type, credentials) {
    const strategy = this.strategies[type];
    if (!strategy) {
      throw new Error(`Unknown auth type: ${type}`);
    }
    return strategy.authenticate(credentials);
  }
}

// DI Container setup
container.register({
  authService: asClass(AuthService).inject(() => ({
    strategies: {
      jwt: container.resolve('jwtStrategy'),
      oauth: container.resolve('oauthStrategy'),
      saml: container.resolve('samlStrategy') // Dễ dàng thêm mới
    }
  }))
});
```

---

### 3. Liskov Substitution Principle (LSP)

**✅ Subclass có thể thay thế parent class mà không ảnh hưởng logic**

#### ✅ Tuân thủ LSP:
```javascript
// Base Repository (Abstract)
class BaseRepository {
  async findById(id) {
    throw new Error('Must implement findById()');
  }
  
  async save(entity) {
    throw new Error('Must implement save()');
  }
  
  async delete(id) {
    throw new Error('Must implement delete()');
  }
}

// User Repository - có thể thay thế BaseRepository
class PrismaUserRepository extends BaseRepository {
  async findById(id) {
    const data = await prisma.nguoiDung.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }
  
  async save(user) {
    await prisma.nguoiDung.create({ data: this.toPersistence(user) });
  }
  
  async delete(id) {
    await prisma.nguoiDung.delete({ where: { id } });
  }
  
  // Custom methods
  async findByEmail(email) {
    const data = await prisma.nguoiDung.findUnique({ where: { email } });
    return data ? this.toDomain(data) : null;
  }
}

// Activity Repository - cũng có thể thay thế BaseRepository
class PrismaActivityRepository extends BaseRepository {
  async findById(id) {
    const data = await prisma.hoatDong.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }
  
  async save(activity) {
    await prisma.hoatDong.create({ data: this.toPersistence(activity) });
  }
  
  async delete(id) {
    await prisma.hoatDong.delete({ where: { id } });
  }
  
  // Custom methods
  async findByStatus(status) {
    const data = await prisma.hoatDong.findMany({ where: { trang_thai: status } });
    return data.map(d => this.toDomain(d));
  }
}

// Generic Service - hoạt động với bất kỳ Repository nào
class GenericService {
  constructor(repository) {
    this.repository = repository;
  }
  
  async getItem(id) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundError('Item not found');
    }
    return item;
  }
  
  async deleteItem(id) {
    await this.repository.delete(id);
  }
}

// Usage - có thể swap repository mà không ảnh hưởng logic
const userService = new GenericService(new PrismaUserRepository());
const activityService = new GenericService(new PrismaActivityRepository());
```

---

### 4. Interface Segregation Principle (ISP)

**✅ Nhiều interface nhỏ, focused thay vì 1 interface lớn**

#### ❌ Vi phạm ISP:
```javascript
// BAD: Interface quá lớn, bắt implement tất cả
class IUserRepository {
  async findById(id) {}
  async findByEmail(email) {}
  async findAll(filters) {}
  async save(user) {}
  async update(user) {}
  async delete(id) {}
  async bulkInsert(users) {}
  async bulkDelete(ids) {}
  async count() {}
  async exists(id) {}
}

// Query Service chỉ cần read nhưng phải implement write methods
class UserQueryService extends IUserRepository {
  // Phải implement write methods dù không dùng
  async save(user) { throw new Error('Not supported'); }
  async update(user) { throw new Error('Not supported'); }
  async delete(id) { throw new Error('Not supported'); }
  async bulkInsert(users) { throw new Error('Not supported'); }
  async bulkDelete(ids) { throw new Error('Not supported'); }
}
```

#### ✅ Tuân thủ ISP:
```javascript
// GOOD: Nhiều interface nhỏ, focused

// Read-only interface
class IUserReader {
  async findById(id) {
    throw new Error('Must implement findById()');
  }
  
  async findByEmail(email) {
    throw new Error('Must implement findByEmail()');
  }
  
  async findAll(filters) {
    throw new Error('Must implement findAll()');
  }
  
  async count() {
    throw new Error('Must implement count()');
  }
}

// Write-only interface
class IUserWriter {
  async save(user) {
    throw new Error('Must implement save()');
  }
  
  async update(user) {
    throw new Error('Must implement update()');
  }
  
  async delete(id) {
    throw new Error('Must implement delete()');
  }
}

// Bulk operations interface
class IUserBulkOperations {
  async bulkInsert(users) {
    throw new Error('Must implement bulkInsert()');
  }
  
  async bulkDelete(ids) {
    throw new Error('Must implement bulkDelete()');
  }
}

// Query Service - chỉ implement read interface
class UserQueryService extends IUserReader {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }
  
  async findById(id) {
    return this.prisma.nguoiDung.findUnique({ where: { id } });
  }
  
  async findByEmail(email) {
    return this.prisma.nguoiDung.findUnique({ where: { email } });
  }
  
  async findAll(filters) {
    return this.prisma.nguoiDung.findMany({ where: filters });
  }
  
  async count() {
    return this.prisma.nguoiDung.count();
  }
}

// Command Service - chỉ implement write interface
class UserCommandService extends IUserWriter {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }
  
  async save(user) {
    return this.prisma.nguoiDung.create({ data: user });
  }
  
  async update(user) {
    return this.prisma.nguoiDung.update({ 
      where: { id: user.id }, 
      data: user 
    });
  }
  
  async delete(id) {
    return this.prisma.nguoiDung.delete({ where: { id } });
  }
}

// Full Repository - implement tất cả khi cần
class UserRepository extends IUserReader {
  constructor(queryService, commandService) {
    super();
    this.queryService = queryService;
    this.commandService = commandService;
  }
  
  // Delegate to specialized services
  async findById(id) {
    return this.queryService.findById(id);
  }
  
  async save(user) {
    return this.commandService.save(user);
  }
}
```

---

### 5. Dependency Inversion Principle (DIP)

**✅ Phụ thuộc vào abstraction (interfaces), không phụ thuộc concrete implementations**

#### ❌ Vi phạm DIP:
```javascript
// BAD: Use case phụ thuộc concrete implementations
class CreateUserUseCase {
  constructor() {
    // Hard-coded dependencies
    this.userRepository = new PrismaUserRepository();
    this.hashService = new BcryptHashService();
    this.emailService = new NodeMailerService();
  }
  
  async execute(dto) {
    // Khó test, khó thay đổi implementation
    const passwordHash = await this.hashService.hash(dto.password);
    const user = User.create(dto.email, passwordHash, dto.name);
    await this.userRepository.save(user);
    await this.emailService.send(user.email, 'Welcome!');
  }
}
```

#### ✅ Tuân thủ DIP:
```javascript
// GOOD: Use case phụ thuộc abstractions

// Interfaces (Contracts)
class IUserRepository {
  async save(user) { throw new Error('Must implement'); }
  async findByEmail(email) { throw new Error('Must implement'); }
}

class IHashService {
  async hash(plainText) { throw new Error('Must implement'); }
  async compare(plainText, hash) { throw new Error('Must implement'); }
}

class IEmailService {
  async sendWelcomeEmail(email, name) { throw new Error('Must implement'); }
}

// Use Case - chỉ phụ thuộc interfaces
class CreateUserUseCase {
  constructor(userRepository, hashService, emailService) {
    // Inject dependencies (interfaces)
    this.userRepository = userRepository; // IUserRepository
    this.hashService = hashService;       // IHashService
    this.emailService = emailService;     // IEmailService
  }
  
  async execute(dto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError('User exists');
    
    const passwordHash = await this.hashService.hash(dto.password);
    const user = User.create(dto.email, passwordHash, dto.name);
    
    await this.userRepository.save(user);
    await this.emailService.sendWelcomeEmail(user.email, user.name);
    
    return { userId: user.id };
  }
}

// Implementations
class PrismaUserRepository extends IUserRepository {
  async save(user) { /* Prisma implementation */ }
  async findByEmail(email) { /* Prisma implementation */ }
}

class BcryptHashService extends IHashService {
  async hash(plainText) { return bcrypt.hash(plainText, 10); }
  async compare(plainText, hash) { return bcrypt.compare(plainText, hash); }
}

class NodeMailerService extends IEmailService {
  async sendWelcomeEmail(email, name) { /* NodeMailer implementation */ }
}

// Dependency Injection Container
const container = createContainer();

container.register({
  // Register implementations
  userRepository: asClass(PrismaUserRepository).singleton(),
  hashService: asClass(BcryptHashService).singleton(),
  emailService: asClass(NodeMailerService).singleton(),
  
  // Use case gets injected with implementations
  createUserUseCase: asClass(CreateUserUseCase).inject((c) => ({
    userRepository: c.userRepository,
    hashService: c.hashService,
    emailService: c.emailService
  }))
});

// Easy to swap implementations
// container.register({
//   emailService: asClass(SendGridEmailService).singleton() // Swap to SendGrid
// });

// Easy to test with mocks
const mockRepo = { save: jest.fn(), findByEmail: jest.fn() };
const mockHash = { hash: jest.fn() };
const mockEmail = { sendWelcomeEmail: jest.fn() };
const useCase = new CreateUserUseCase(mockRepo, mockHash, mockEmail);
```

---

## 📝 Clean Code Best Practices

### 1. Meaningful Names

```javascript
// ❌ BAD
const d = new Date();
const u = await db.find(id);
function calc(a, b) { return a * b; }

// ✅ GOOD
const currentDate = new Date();
const user = await userRepository.findById(userId);
function calculateTotalPrice(quantity, unitPrice) {
  return quantity * unitPrice;
}

// Constants
const MAX_LOGIN_ATTEMPTS = 5;
const DEFAULT_PAGE_SIZE = 20;
const BCRYPT_SALT_ROUNDS = 10;

// Boolean variables
const isValidEmail = emailValidator.validate(email);
const hasPermission = user.permissions.includes('users.write');
const canDeleteUser = user.role === 'ADMIN';

// Functions returning boolean
function isPasswordStrong(password) {
  return password.length >= 8 && /[A-Z]/.test(password);
}

function hasReachedAttendanceLimit(registrations) {
  return registrations.length >= MAX_REGISTRATIONS;
}
```

### 2. Small Functions

```javascript
// ❌ BAD: Function quá lớn
async function registerUser(email, password, name, phone, address, city) {
  // Validation
  if (!email.includes('@')) throw new Error('Invalid email');
  if (password.length < 8) throw new Error('Password too short');
  if (!name) throw new Error('Name required');
  
  // Check exists
  const existing = await db.users.findOne({ email });
  if (existing) throw new Error('User exists');
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  // Create user
  const user = await db.users.create({
    email, password: hash, name, phone, address, city
  });
  
  // Send email
  await sendEmail(email, 'Welcome!');
  
  // Log
  console.log('User registered:', user.id);
  
  return user;
}

// ✅ GOOD: Chia nhỏ, mỗi function một việc
function validateEmail(email) {
  if (!email?.includes('@')) {
    throw new ValidationError('Invalid email format');
  }
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }
}

function validateRequiredField(value, fieldName) {
  if (!value || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required`);
  }
}

async function checkUserExists(email) {
  const user = await userRepository.findByEmail(email);
  if (user) {
    throw new ConflictError('User with this email already exists');
  }
}

async function hashPassword(password) {
  return hashService.hash(password);
}

async function createUserRecord(userData) {
  return userRepository.save(userData);
}

async function sendWelcomeEmail(email, name) {
  await emailService.sendWelcomeEmail(email, name);
}

// Main function - orchestrate
async function registerUser(dto) {
  validateEmail(dto.email);
  validatePassword(dto.password);
  validateRequiredField(dto.name, 'Name');
  
  await checkUserExists(dto.email);
  
  const passwordHash = await hashPassword(dto.password);
  const user = User.create(dto.email, passwordHash, dto.name);
  
  await createUserRecord(user);
  await sendWelcomeEmail(user.email, user.name);
  
  logger.info('User registered', { userId: user.id });
  
  return user;
}
```

### 3. DRY (Don't Repeat Yourself)

```javascript
// ❌ BAD: Lặp code
async function getActivities(req, res) {
  try {
    const activities = await prisma.hoatDong.findMany();
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function getRegistrations(req, res) {
  try {
    const registrations = await prisma.dangKyHoatDong.findMany();
    res.json({ success: true, data: registrations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

// ✅ GOOD: Tái sử dụng
class ApiPresenter {
  static success(data, message = null) {
    return { success: true, data, message };
  }
  
  static error(message, code = 500) {
    return { success: false, error: message, code };
  }
  
  static paginated(data, pagination) {
    return {
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit)
      }
    };
  }
}

// Async handler wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Controllers
class ActivitiesController {
  async getAll(req, res) {
    const activities = await activityRepository.findAll();
    res.json(ApiPresenter.success(activities));
  }
}

class RegistrationsController {
  async getAll(req, res) {
    const registrations = await registrationRepository.findAll();
    res.json(ApiPresenter.success(registrations));
  }
}

// Routes
router.get('/activities', asyncHandler(activitiesController.getAll));
router.get('/registrations', asyncHandler(registrationsController.getAll));
```

### 4. Error Handling

```javascript
// Custom Error Classes
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, 404);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

// Error Handler Middleware
function errorHandler(err, req, res, next) {
  // Log error
  logger.error(err.message, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });
  
  // Operational errors (known errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // Programming errors (unknown errors)
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
}

// Usage
class GetUserUseCase {
  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    
    return user;
  }
}
```

---

## 🔧 Dependency Injection Setup

```javascript
// di/container.js
const { createContainer, asClass, asValue } = require('awilix');

function setupContainer() {
  const container = createContainer();
  
  // ========== INFRASTRUCTURE ==========
  
  // Repositories
  container.register({
    userRepository: asClass(PrismaUserRepository).singleton(),
    activityRepository: asClass(PrismaActivityRepository).singleton(),
    registrationRepository: asClass(PrismaRegistrationRepository).singleton(),
    semesterRepository: asClass(PrismaSemesterRepository).singleton(),
    roleRepository: asClass(PrismaRoleRepository).singleton(),
  });
  
  // External Services
  container.register({
    hashService: asClass(BcryptHashService).singleton(),
    tokenService: asClass(JwtTokenService).singleton(),
    emailService: asClass(NodeMailerService).singleton(),
    storageService: asClass(LocalStorageService).singleton(),
    cacheService: asClass(MemoryCache).singleton(),
  });
  
  // ========== APPLICATION ==========
  
  // Auth Use Cases
  container.register({
    loginUseCase: asClass(LoginUseCase),
    registerUseCase: asClass(RegisterUseCase),
    refreshTokenUseCase: asClass(RefreshTokenUseCase),
    logoutUseCase: asClass(LogoutUseCase),
  });
  
  // User Use Cases
  container.register({
    createUserUseCase: asClass(CreateUserUseCase),
    getUserUseCase: asClass(GetUserUseCase),
    updateUserUseCase: asClass(UpdateUserUseCase),
    deleteUserUseCase: asClass(DeleteUserUseCase),
  });
  
  // Activity Use Cases
  container.register({
    createActivityUseCase: asClass(CreateActivityUseCase),
    approveActivityUseCase: asClass(ApproveActivityUseCase),
    getActivitiesUseCase: asClass(GetActivitiesUseCase),
  });
  
  // Permission Use Cases
  container.register({
    getUserPermissionsUseCase: asClass(GetUserPermissionsUseCase),
    updateRolePermissionsUseCase: asClass(UpdateRolePermissionsUseCase),
  });
  
  // ========== PRESENTATION ==========
  
  // Controllers
  container.register({
    authController: asClass(AuthController).singleton(),
    usersController: asClass(UsersController).singleton(),
    activitiesController: asClass(ActivitiesController).singleton(),
    registrationsController: asClass(RegistrationsController).singleton(),
    permissionsController: asClass(PermissionsController).singleton(),
  });
  
  // ========== SHARED ==========
  
  // Logger
  container.register({
    logger: asValue(require('./shared/logger/WinstonLogger')),
  });
  
  return container;
}

module.exports = { setupContainer };
```

---

## ✅ Migration Plan - Chuyển Đổi Từ Cấu Trúc Hiện Tại

### Phase 1: Tạo Domain Layer (2-3 days)
1. Tạo entities từ Prisma models
2. Tạo interfaces cho repositories
3. Tạo value objects cho email, password, studentId

### Phase 2: Tạo Application Layer (3-5 days)
1. Extract business logic thành use cases
2. Tạo DTOs cho validation
3. Tạo mappers cho entity ↔ DTO

### Phase 3: Refactor Infrastructure (2-3 days)
1. Wrap Prisma queries trong repositories
2. Implement interfaces
3. Tạo service implementations

### Phase 4: Refactor Presentation (2-3 days)
1. Slim down controllers (chỉ HTTP handling)
2. Move business logic vào use cases
3. Standardize response format

### Phase 5: Setup DI Container (1-2 days)
1. Setup awilix container
2. Register all dependencies
3. Inject dependencies vào controllers

### Phase 6: Testing (3-5 days)
1. Unit tests cho use cases
2. Integration tests cho repositories
3. E2E tests cho API

---

## 📚 Best Practices Summary

### ✅ DO
- ✅ Mỗi class/file một trách nhiệm duy nhất
- ✅ Sử dụng dependency injection
- ✅ Code theo interfaces, không theo implementations
- ✅ Viết tests cho business logic
- ✅ Sử dụng custom errors
- ✅ Log structured data
- ✅ Validate input tại DTO layer
- ✅ Use cases không phụ thuộc framework
- ✅ Entities chứa business rules
- ✅ Repositories chỉ làm data access

### ❌ DON'T
- ❌ Không để business logic trong controllers
- ❌ Không hardcode dependencies
- ❌ Không query database trực tiếp trong controllers
- ❌ Không catch errors và im lặng
- ❌ Không lặp code (DRY)
- ❌ Không để functions quá dài (> 20 lines)
- ❌ Không dùng var, magic numbers
- ❌ Không commit sensitive data
- ❌ Không skip validation
- ❌ Không mix concerns (separation of concerns)

---

## 🎓 References

1. **Clean Architecture** - Robert C. Martin (Uncle Bob)
2. **SOLID Principles** - Robert C. Martin
3. **Domain-Driven Design** - Eric Evans
4. **Clean Code** - Robert C. Martin
5. **Dependency Injection Principles** - Mark Seemann

---

**Next Steps:**
1. Đọc `FRONTEND_CLEAN_ARCHITECTURE.md` để hiểu cấu trúc frontend
2. Bắt đầu refactor theo phase plan
3. Setup testing framework
4. Implement CI/CD pipeline
