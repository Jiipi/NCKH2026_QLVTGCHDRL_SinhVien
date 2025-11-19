# Session Tracking Setup

## Database Already Ready ✅

Model `PhienDangNhap` đã có sẵn trong schema.prisma:
- Không cần migration mới
- Table đã tồn tại trong database

## Verify Database

Check xem table có tồn tại không:

```sql
-- PostgreSQL
SELECT * FROM phien_dang_nhap LIMIT 5;

-- Check count
SELECT COUNT(*) FROM phien_dang_nhap;
```

## If Migration Needed (Optional)

Nếu table chưa có (không nên xảy ra):

```bash
cd backend
npx prisma generate
npx prisma db push
```

## Test Session Tracking

```bash
# Backend test
cd backend
node scripts/test_session_tracking.js

# Expected output:
# ✅ Session tracked successfully
# ✅ Found N active session(s)
# ✅ Active users: {...}
```

## Environment Variables

No new env vars required! Sử dụng DATABASE_URL hiện tại.

## Cron Job Setup (Optional)

Để cleanup old sessions tự động:

### Using node-cron (Recommended)

```javascript
// backend/src/index.js
const cron = require('node-cron');
const cleanupSessions = require('./jobs/cleanupSessions.job');

// Run cleanup every day at 3 AM
cron.schedule('0 3 * * *', () => {
  console.log('Running session cleanup job...');
  cleanupSessions();
});
```

### Using System Cron

```bash
# Add to crontab
0 3 * * * cd /path/to/project/backend && node src/jobs/cleanupSessions.job.js
```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Login creates session in `phien_dang_nhap` table
- [ ] Heartbeat updates `lan_hoat_dong`
- [ ] `/api/core/sessions/active-users` returns data
- [ ] Frontend shows activity indicators
- [ ] Logout removes session

## Troubleshooting

### Session không được track
- Check `X-Tab-Id` header trong request
- Verify middleware được apply đúng route
- Check console logs: `[SessionTracker]`

### Active users không hiển thị
- Verify heartbeat đang chạy (check Network tab)
- Check threshold time (default: 5 phút)
- Refresh active users manually

### Database errors
- Run `npx prisma generate` để regenerate client
- Check connection string trong `.env`
