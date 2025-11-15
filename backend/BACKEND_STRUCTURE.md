# Cấu trúc Backend

## Tổng quan
Backend đã được refactor hoàn toàn theo kiến trúc modular, clean architecture với separation of concerns rõ ràng.

## Cấu trúc thư mục chính

```
backend/
├── src/
│   ├── app/                    # Application layer
│   │   ├── errors/            # Application-specific errors
│   │   ├── factories/         # Object factories
│   │   ├── policies/          # Application policies
│   │   └── scopes/            # Data scopes
│   │
│   ├── core/                   # Core framework (reusable)
│   │   ├── config/            # Configuration management
│   │   ├── errors/            # Core error classes
│   │   ├── http/              # HTTP layer
│   │   │   ├── middleware/    # Express middleware
│   │   │   └── response/      # Response formatters
│   │   ├── logger/            # Logging utilities
│   │   ├── policies/          # Authorization policies
│   │   ├── uploads/           # File upload handlers
│   │   │   ├── attachments/
│   │   │   ├── avatars/
│   │   │   └── images/
│   │   └── utils/             # Core utilities
│   │
│   ├── infrastructure/         # Infrastructure layer
│   │   ├── prisma/            # Database access
│   │   │   ├── client.js      # Prisma client
│   │   │   └── mappers/       # Data mappers
│   │   └── repositories/      # Repository pattern implementations
│   │
│   ├── modules/                # Feature modules (domain logic)
│   │   ├── activities/        # Hoạt động
│   │   ├── activity-types/    # Loại hoạt động
│   │   ├── auth/              # Authentication & Authorization
│   │   ├── classes/           # Lớp học
│   │   ├── dashboard/         # Dashboard & statistics
│   │   ├── exports/           # Data export
│   │   ├── monitor/           # Lớp trưởng features
│   │   ├── notification-types/# Loại thông báo
│   │   ├── notifications/     # Thông báo
│   │   ├── points/            # Điểm rèn luyện
│   │   ├── profile/           # User profile
│   │   ├── registrations/     # Đăng ký hoạt động
│   │   ├── roles/             # Vai trò
│   │   ├── search/            # Tìm kiếm
│   │   ├── semesters/         # Học kỳ
│   │   ├── teachers/          # Giảng viên
│   │   └── users/             # Người dùng
│   │
│   ├── services/               # Cross-cutting services
│   │   ├── admin-reports.service.js
│   │   ├── admin-reports.repo.js
│   │   ├── admin-users.service.js
│   │   ├── auth.service.js
│   │   ├── auto-point-calculation.service.js
│   │   ├── broadcast.service.js
│   │   ├── qr-attendance.service.js
│   │   ├── reference-data.service.js
│   │   ├── semesterClosure.service.js
│   │   ├── student-points.service.js
│   │   └── index.js
│   │
│   ├── models/                 # Legacy models (minimal)
│   │   ├── auth.model.js      # Auth helpers
│   │   └── user.model.js      # User helpers
│   │
│   ├── controllers/            # Legacy controllers (minimal)
│   │   └── upload.controller.js
│   │
│   ├── routes/                 # API routes
│   │   └── index.js           # Main router
│   │
│   └── index.js               # Application entry point
│
├── prisma/                     # Prisma schema & migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
│
├── scripts/                    # Utility scripts
│   ├── security_smoke_tests.js
│   ├── test_semester_sync.js
│   ├── smoke_semester_sync.js
│   ├── patch_semester_permissions.js
│   └── add_demo_users.js
│
├── tests/                      # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── data/                       # Runtime data
│   └── semesters/             # Semester closure data
│
├── uploads/                    # Uploaded files
│   ├── images/
│   ├── attachments/
│   └── avatars/
│
├── logs/                       # Application logs
│
├── .env                        # Environment variables
├── package.json
├── jest.config.js
└── QUICK_REFERENCE.md         # API & code reference

```

## Module Structure
Mỗi module trong `src/modules/` có cấu trúc:
```
module-name/
├── module-name.controller.js   # HTTP handlers
├── module-name.service.js      # Business logic
├── module-name.repo.js        # Data access (optional)
├── module-name.routes.js      # Route definitions
└── index.js                   # Module exports
```

## Core Principles

### 1. Layered Architecture
- **Presentation Layer**: Routes & Controllers
- **Business Logic Layer**: Services
- **Data Access Layer**: Repositories & Prisma
- **Cross-cutting Concerns**: Core utilities, middleware

### 2. Dependency Flow
```
Routes → Controllers → Services → Repositories → Prisma
                    ↓
                Core Utils
```

### 3. Import Paths
- Core utilities: `require('../../core/logger')`
- Infrastructure: `require('../../infrastructure/prisma/client')`
- Services: `require('../../services/auth.service')`
- Modules: `require('../activity-types/activity-types.service')`

### 4. No Circular Dependencies
- Core không phụ thuộc vào modules
- Services có thể dùng core
- Modules có thể dùng services và core

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Class-scope data isolation

### Semester Management
- Semester locking/unlocking
- State snapshots
- Metadata tracking

### Security
- Input sanitization
- Rate limiting
- Helmet security headers
- CORS configuration

### Data Validation
- Zod schemas
- Request validation middleware
- Type-safe data handling

### Error Handling
- Centralized error handling
- Custom error classes
- Structured error responses

### Logging
- Winston logger
- Request/response logging
- Error tracking

## File Organization Rules

### ✅ Correct Structure
- All business logic in modules
- Shared utilities in core
- Database access in infrastructure
- Cross-module services in services/

### ❌ Anti-patterns (Removed)
- No `src/lib/` or `src/libs/`
- No `src/shared/` at root level
- No duplicate `backend/backend/`
- No old utils imports

## Migration Status
✅ **COMPLETED**
- All modules migrated to new structure
- All imports updated to correct paths
- Legacy code removed
- Duplicate directories cleaned up
- Old migration scripts removed

## Testing
```bash
npm test              # Run all tests
npm run test:unit     # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e      # End-to-end tests
npm run test:security # Security smoke tests
```

## Scripts
```bash
npm run dev           # Development with nodemon
npm start             # Production
npm run migrate       # Run Prisma migrations
npm run studio        # Open Prisma Studio
npm run seed          # Seed database
```

## Environment Variables
Required in `.env`:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `NODE_ENV`

## Database
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Migrations**: Automatic via Prisma
- **Naming**: Snake_case (Vietnamese model names)

## API Documentation
See `QUICK_REFERENCE.md` for:
- API endpoints
- Request/response formats
- Authentication requirements
- Permission requirements

---

**Last Updated**: November 13, 2025
**Migration Status**: ✅ Complete
**Architecture**: Clean Architecture + Modular Design
