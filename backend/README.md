# Backend API Documentation

## Middleware Chain Architecture

The backend API uses a layered middleware architecture to ensure consistent authentication, semester validation, and role-based data filtering across all protected endpoints.

### Middleware Execution Order

All `/core/*` routes follow this middleware chain:

```
Request → authenticate → validateAndInjectSemester → applyScope → Controller
```

Each middleware enriches the request object with additional context:

1. **authenticate**: Adds `req.user` (JWT payload with user ID and role)
2. **validateAndInjectSemester**: Adds `req.semester` (parsed and validated semester context)
3. **applyScope**: Adds `req.scope` (Prisma where clause for role-based filtering)

### 1. Authentication Middleware (`authenticate`)

**Location**: `backend/src/core/http/middleware/authJwt.ts`

**Purpose**: Verifies JWT token and attaches user information to the request.

**What it adds to `req` object**:
```typescript
req.user = {
  sub: string;      // User ID
  role: string;     // Normalized role (ADMIN, GIANG_VIEN, LOP_TRUONG, SINH_VIEN)
  tabId?: string;   // Optional tab ID for multi-tab session management
  iat?: number;     // Token issued at timestamp
  exp?: number;     // Token expiration timestamp
}
```

**Process**:
1. Extracts JWT token from `Authorization: Bearer <token>` header
2. Verifies token signature using `JWT_SECRET`
3. Decodes JWT payload to get user ID and role
4. If role is missing, hydrates from database (`nguoi_dung` table)
5. Normalizes role to uppercase standard format
6. Attaches user object to `req.user`

**Error Responses**:

| Status | Error Code | Message | Condition |
|--------|-----------|---------|-----------|
| 401 | `UNAUTHORIZED` | "Token không được cung cấp" | No Authorization header |
| 401 | `UNAUTHORIZED` | "Token đã hết hạn" | Token expired |
| 401 | `UNAUTHORIZED` | "Token không hợp lệ" | Invalid token signature |

**Example**:
```typescript
// Request header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// After middleware
req.user = {
  sub: "user-123",
  role: "SINH_VIEN",
  tabId: "tab-abc",
  iat: 1704067200,
  exp: 1704153600
}
```

### 2. Semester Validation Middleware (`validateAndInjectSemester`)

**Location**: `backend/src/app/middleware/semesterMiddleware.ts`

**Purpose**: Validates semester access permissions and injects parsed semester context into the request.

**What it adds to `req` object**:
```typescript
req.semester = {
  hoc_ky: string;   // 'hoc_ky_1' or 'hoc_ky_2'
  nam_hoc: string;  // '2025' (normalized single year format)
  key: string;      // 'hoc_ky_1_2025' (composite key)
}
```

**Process**:
1. Extracts semester from query parameters (`?semester=hoc_ky_1_2025` or `?semesterValue=hoc_ky_1_2025`)
2. If no semester provided, uses current semester from metadata
3. Validates semester format: `hoc_ky_[12]_YYYY`
4. **Access Control**: Only ADMIN can access non-current semesters
5. **Lock Check**: For write operations (POST, PUT, PATCH, DELETE), checks if semester is locked
   - Converts single year format (2025) to double year format (2025-2026 or 2024-2025)
   - Queries `SemesterClosureService` to check lock status for user's class
   - Returns 423 if semester is locked for the user
6. Injects parsed semester context into `req.semester`

**Error Responses**:

| Status | Error Code | Message | Condition |
|--------|-----------|---------|-----------|
| 400 | `INVALID_SEMESTER_FORMAT` | "Semester must be in format: hoc_ky_1_2025 or hoc_ky_2_2025" | Invalid semester format |
| 403 | `SEMESTER_ACCESS_DENIED` | "Bạn chỉ có thể truy cập học kỳ hiện tại" | Non-admin accessing other semester |
| 423 | `SEMESTER_LOCKED` | "Học kỳ này đã bị khóa" | Write operation on locked semester |

**Example**:
```typescript
// Request: GET /core/activities?semester=hoc_ky_1_2025
// User role: SINH_VIEN
// Current semester: hoc_ky_1_2025

// After middleware
req.semester = {
  hoc_ky: "hoc_ky_1",
  nam_hoc: "2025",
  key: "hoc_ky_1_2025"
}

// Request: GET /core/activities?semester=hoc_ky_2_2024
// User role: SINH_VIEN
// Current semester: hoc_ky_1_2025
// Response: 403 SEMESTER_ACCESS_DENIED

// Request: POST /core/activities (create activity)
// User role: LOP_TRUONG
// Semester: hoc_ky_1_2025 (locked for user's class)
// Response: 423 SEMESTER_LOCKED
```

**Semester Lock Logic**:
- Only applies to write operations (POST, PUT, PATCH, DELETE)
- Admin users bypass lock checks
- Checks lock status via `SemesterClosureService.enforceWritableForUserSemesterOrThrow()`
- Automatically determines user's class ID from database
- Returns detailed error with class ID and lock reason

### 3. Scope Middleware (`applyScope`)

**Location**: `backend/src/app/scopes/scopeMiddleware.ts`

**Purpose**: Applies role-based data filtering to ensure users only see data they're authorized to access.

**What it adds to `req` object**:
```typescript
req.scope = {
  // Prisma where clause based on user role
  // Examples below
}
req.scopedResource = string;  // Resource name (e.g., 'activities')
```

**Process**:
1. Checks that user is authenticated (`req.user` must exist)
2. Calls `buildScope(resource, user)` to generate role-specific filter
3. Attaches scope to `req.scope` for use in controllers/repositories
4. Attaches resource name to `req.scopedResource`

**Scope Examples by Role**:

#### Admin Scope
```typescript
// Admin sees everything - no filtering
req.scope = {}
```

#### Teacher Scope (GIANG_VIEN)
```typescript
// Teacher sees activities from classes they manage (chu_nhiem)
req.scope = {
  OR: [
    { nguoi_tao_id: "teacher-user-id" },  // Activities they created
    { lop_id: { in: ["class-1", "class-2"] } }  // Activities from their classes
  ]
}
```

#### Class Monitor Scope (LOP_TRUONG)
```typescript
// Monitor sees activities from their class
req.scope = {
  OR: [
    { nguoi_tao_id: "monitor-user-id" },  // Activities they created
    { lop_id: "their-class-id" }  // Activities for their class
  ]
}
```

#### Student Scope (SINH_VIEN)
```typescript
// Student sees activities from their class or created by classmates
req.scope = {
  OR: [
    { lop_id: "student-class-id" },  // Activities assigned to their class
    { nguoi_tao_id: { in: ["classmate-1", "classmate-2", "teacher-id"] } }  // Created by classmates/teacher
  ]
}
```

**Error Responses**:

| Status | Error Code | Message | Condition |
|--------|-----------|---------|-----------|
| 401 | `UNAUTHORIZED` | "Authentication required" | No user in request |
| 500 | `INTERNAL_ERROR` | "Error applying access scope" | Scope building failed |

**Example**:
```typescript
// Request: GET /core/activities
// User: Student in Class A

// After middleware
req.scope = {
  OR: [
    { lop_id: "class-a-id" },
    { nguoi_tao_id: { in: ["student-1", "student-2", "teacher-1"] } }
  ]
}
req.scopedResource = "activities"

// Controller uses scope in query
const activities = await repository.findMany({
  where: {
    ...req.scope,  // Automatically filters by class
    trang_thai: "da_duyet"
  }
});
```

### Routes with Scope Middleware

The following routes have scope middleware applied:

```typescript
// Activities - scope applied
router.use('/core/activities', applyScope('activities'), activitiesV2.routes);

// Registrations - scope applied
router.use('/core/registrations', applyScope('registrations'), registrationsV2.routes);

// Points - scope applied
router.use('/core/points', applyScope('points'), pointsV2.routes);

// Dashboard - scope applied
router.use('/core/dashboard', applyScope('dashboard'), dashboardV2.routes);
```

### Complete Middleware Flow Example

**Scenario**: Student queries activities for current semester

```typescript
// 1. Request
GET /core/activities?status=da_duyet
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 2. After authenticate middleware
req.user = {
  sub: "student-123",
  role: "SINH_VIEN"
}

// 3. After validateAndInjectSemester middleware
req.semester = {
  hoc_ky: "hoc_ky_1",
  nam_hoc: "2025",
  key: "hoc_ky_1_2025"
}

// 4. After applyScope middleware
req.scope = {
  OR: [
    { lop_id: "class-a" },
    { nguoi_tao_id: { in: ["student-1", "student-2", "teacher-1"] } }
  ]
}

// 5. Controller builds final query
const where = {
  ...req.scope,  // Class filtering
  hoc_ky: req.semester.hoc_ky,  // Semester filtering
  nam_hoc: req.semester.nam_hoc,
  trang_thai: "da_duyet"  // Status filtering
}

// 6. Repository executes query
const activities = await prisma.hoatDong.findMany({ where });

// Result: Only approved activities from student's class in current semester
```

### Error Response Format

All middleware errors follow this format:

```typescript
{
  success: false,
  error: string,      // Error code (e.g., 'INVALID_SEMESTER_FORMAT')
  message: string,    // Human-readable message
  details?: object    // Optional additional details
}
```

### Security Considerations

1. **Authentication First**: All `/core/*` routes require valid JWT token
2. **Semester Isolation**: Non-admin users cannot access other semesters
3. **Role-Based Filtering**: Scope middleware ensures data isolation between classes
4. **Semester Locks**: Write operations blocked on locked semesters
5. **No Scope Bypass**: Controllers must use `req.scope` - cannot bypass filtering

### Performance Optimizations

1. **Scope Caching**: Scope building queries are optimized with database indexes
2. **Minimal Queries**: Middleware makes minimal database calls (1-2 per request)
3. **Index Support**: Database indexes on `lop_id`, `nguoi_tao_id`, `hoc_ky`, `nam_hoc`
4. **Early Validation**: Invalid requests rejected before reaching controllers

### Testing Middleware

**Unit Tests**:
```typescript
// Test authentication
it('should reject requests without token', async () => {
  const response = await request(app).get('/core/activities');
  expect(response.status).toBe(401);
});

// Test semester validation
it('should reject non-admin accessing other semester', async () => {
  const response = await request(app)
    .get('/core/activities?semester=hoc_ky_2_2024')
    .set('Authorization', `Bearer ${studentToken}`);
  expect(response.status).toBe(403);
});

// Test scope filtering
it('should filter activities by student class', async () => {
  const response = await request(app)
    .get('/core/activities')
    .set('Authorization', `Bearer ${studentToken}`);
  expect(response.body.data.every(a => a.lop_id === 'student-class')).toBe(true);
});
```

### Debugging Middleware

**Enable Debug Logging**:
```bash
# Set environment variable
DEBUG=middleware:* npm run dev
```

**Check Request Context**:
```typescript
// In controller
console.log('User:', req.user);
console.log('Semester:', req.semester);
console.log('Scope:', req.scope);
```

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid token | Check Authorization header |
| 403 Semester Access Denied | Non-admin accessing other semester | Use current semester or admin account |
| 423 Semester Locked | Writing to locked semester | Contact admin to unlock semester |
| Empty results | Scope filtering too restrictive | Check user's class assignment |

### Related Documentation

- **Scope Builder**: `backend/src/app/scopes/scopeBuilder.ts` - Role-specific scope logic
- **Semester Utils**: `backend/src/core/utils/semester.ts` - Semester parsing and validation
- **Semester Closure**: `backend/src/business/services/semesterClosure.service.ts` - Lock management
- **Routes**: `backend/src/app/routes.ts` - Middleware registration

---

## API Endpoints

See individual module documentation for endpoint details:
- Activities: `backend/src/modules/activities/README.md`
- Registrations: `backend/src/modules/registrations/README.md`
- Users: `backend/src/modules/users/README.md`
- Classes: `backend/src/modules/classes/README.md`

## Development

### Running Tests
```bash
npm test                 # All tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:coverage    # With coverage report
```

### Database Migrations
```bash
npm run migrate          # Run migrations
npm run studio           # Open Prisma Studio
npm run seed             # Seed database
```

### Starting Development Server
```bash
npm run dev              # Start with nodemon + ts-node
```
