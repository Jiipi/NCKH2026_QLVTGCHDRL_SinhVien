# Session Tracking & Activity Status

Hệ thống tracking phiên đăng nhập và trạng thái hoạt động của user.

## Backend

### Files Created
- `backend/src/services/session-tracking.service.js` - Service xử lý session tracking
- `backend/src/core/http/middleware/sessionTracking.js` - Middleware tracking
- `backend/src/routes/sessions.route.js` - API endpoints

### API Endpoints

```
GET  /api/core/sessions/active-users      - Lấy danh sách user đang active
GET  /api/core/sessions/my-sessions       - Lấy sessions của user hiện tại
GET  /api/core/sessions/status/:userId    - Lấy trạng thái của 1 user
POST /api/core/sessions/heartbeat         - Cập nhật heartbeat (2 phút)
DELETE /api/core/sessions/logout          - Xóa session khi logout
```

### Database
Model `PhienDangNhap` tracking:
- `nguoi_dung_id` - User ID
- `ma_tab` - Unique tab identifier
- `lan_hoat_dong` - Last activity (auto-update với @updatedAt)
- `vai_tro` - User role

### Usage Backend

```javascript
const SessionTrackingService = require('./services/session-tracking.service');

// Track session khi login
await SessionTrackingService.trackSession(userId, tabId, role);

// Get active users (trong vòng 5 phút)
const active = await SessionTrackingService.getActiveUsers(5);
// Returns: { userIds: [], userCodes: [], sessionCount: 0 }

// Check user status
const status = await SessionTrackingService.getUserActivityStatus(userId);
```

## Frontend

### Files Created
- `frontend/src/shared/lib/sessionTracker.js` - Session tracker utility
- `frontend/src/shared/hooks/useSessionTracking.js` - React hook

### Usage Frontend

```javascript
import { useSessionTracking } from './shared/hooks/useSessionTracking';

function MyComponent() {
  const { 
    isTracking,           // Boolean: đang track?
    activeUsers,          // { userIds, userCodes, sessionCount }
    refreshActiveUsers,   // Function: refresh danh sách
    isUserActive,         // Function: check user có active không
    getUserStatus,        // Function: lấy chi tiết status
    tabId                 // String: tab ID hiện tại
  } = useSessionTracking(true);

  // Check user có active không
  const active = isUserActive(user.id, user.ten_dn);

  // Refresh active users mỗi 30s
  useEffect(() => {
    const interval = setInterval(() => {
      refreshActiveUsers(5); // 5 minutes threshold
    }, 30000);
    return () => clearInterval(interval);
  }, []);
}
```

## Cách hoạt động

1. **Khi Login**: Tạo session với `tabId` unique
2. **Heartbeat**: Gửi heartbeat mỗi 2 phút để update `lan_hoat_dong`
3. **Active Check**: User được coi là active nếu activity < 5 phút
4. **Frontend Display**: So sánh `activeUsers` với user list để hiển thị status

## Auto-update Dates

### Registration Dates
Khi approve/reject registration:
```javascript
// Trong registrations.service.js - bulkUpdate()
const data = action === 'approve'
  ? { trang_thai_dk: 'da_duyet', ngay_duyet: new Date() }
  : { trang_thai_dk: 'tu_choi', ngay_duyet: new Date() };
```

### Activity Tracking
- `ngay_dang_ky`: Auto-set khi tạo registration (Prisma @default(now()))
- `ngay_duyet`: Set khi approve/reject
- `lan_hoat_dong`: Auto-update mỗi khi có request (Prisma @updatedAt)
- `lan_cuoi_dn`: Update khi login thành công
