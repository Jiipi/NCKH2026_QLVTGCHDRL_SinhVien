/**
 * Test Session Tracking Service
 * Run: node backend/scripts/test_session_tracking.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSessionTracking() {
  console.log('🧪 Testing Session Tracking Service\n');
  console.log('='.repeat(80));

  try {
    // Import service
    const SessionTrackingService = require('../src/services/session-tracking.service');

    // 1. Get a test user
    console.log('\n📌 Step 1: Finding test user...');
    const testUser = await prisma.nguoiDung.findFirst({
      where: {
        vai_tro: {
          ten_vt: 'SINH_VIEN'
        }
      },
      include: {
        vai_tro: true
      }
    });

    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }

    console.log(`✅ Found user: ${testUser.ten_dn} (${testUser.id})`);

    // 2. Track session
    console.log('\n📌 Step 2: Tracking session...');
    const tabId = `test_tab_${Date.now()}`;
    const session = await SessionTrackingService.trackSession(
      testUser.id,
      tabId,
      testUser.vai_tro.ten_vt
    );

    if (session) {
      console.log('✅ Session tracked successfully');
      console.log(`   - Tab ID: ${session.ma_tab}`);
      console.log(`   - Created: ${session.thoi_gian_tao}`);
      console.log(`   - Last Activity: ${session.lan_hoat_dong}`);
    }

    // 3. Update activity
    console.log('\n📌 Step 3: Updating activity...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    const updated = await SessionTrackingService.updateSessionActivity(tabId);
    console.log(`✅ Activity updated: ${updated}`);

    // 4. Get active sessions
    console.log('\n📌 Step 4: Getting active sessions...');
    const activeSessions = await SessionTrackingService.getActiveSessions(testUser.id, 5);
    console.log(`✅ Found ${activeSessions.length} active session(s)`);
    activeSessions.forEach((s, i) => {
      console.log(`   ${i + 1}. Tab: ${s.ma_tab.substring(0, 20)}... - Last: ${s.lan_hoat_dong}`);
    });

    // 5. Get all active users
    console.log('\n📌 Step 5: Getting all active users...');
    const activeUsers = await SessionTrackingService.getActiveUsers(5);
    console.log(`✅ Active users in last 5 minutes:`);
    console.log(`   - User IDs: ${activeUsers.userIds.length}`);
    console.log(`   - User Codes: ${activeUsers.userCodes.length}`);
    console.log(`   - Total Sessions: ${activeUsers.sessionCount}`);

    // 6. Get user activity status
    console.log('\n📌 Step 6: Getting user activity status...');
    const status = await SessionTrackingService.getUserActivityStatus(testUser.id);
    console.log('✅ User Activity Status:');
    console.log(`   - Username: ${status.username}`);
    console.log(`   - Account Status: ${status.accountStatus}`);
    console.log(`   - Is Active: ${status.isActive}`);
    console.log(`   - Last Login: ${status.lastLogin}`);
    console.log(`   - Last Activity: ${status.lastActivity}`);

    // 7. Cleanup test session
    console.log('\n📌 Step 7: Cleaning up test session...');
    const removed = await SessionTrackingService.removeSession(tabId);
    console.log(`✅ Session removed: ${removed}`);

    // 8. Test cleanup old sessions
    console.log('\n📌 Step 8: Testing cleanup old sessions...');
    const deletedCount = await SessionTrackingService.cleanupOldSessions(0.001); // 0.001 hours = few seconds
    console.log(`✅ Cleaned up ${deletedCount} old session(s)`);

    // 9. Check PhienDangNhap table stats
    console.log('\n📌 Step 9: Checking PhienDangNhap table stats...');
    const totalSessions = await prisma.phienDangNhap.count();
    const recentSessions = await prisma.phienDangNhap.count({
      where: {
        lan_hoat_dong: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      }
    });
    console.log(`✅ Total sessions in DB: ${totalSessions}`);
    console.log(`✅ Active sessions (< 5 min): ${recentSessions}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ All tests completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testSessionTracking();
