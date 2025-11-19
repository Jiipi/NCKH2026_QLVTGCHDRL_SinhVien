/**
 * Example: Using Session Tracking in AdminUsersPage
 * Add this to your existing AdminUsersPage component
 */

import { useSessionTracking } from '../../../shared/hooks/useSessionTracking';
import { UserActivityIndicator, UserStatusBadge } from '../../../shared/ui/UserActivityIndicator';

// Inside your component:
export default function AdminUsersPage() {
  // ... existing state ...
  
  // Add session tracking
  const { activeUsers, refreshActiveUsers, isUserActive } = useSessionTracking(true);

  // Refresh active users every 30 seconds
  useEffect(() => {
    refreshActiveUsers(5); // 5 minutes threshold
    
    const interval = setInterval(() => {
      refreshActiveUsers(5);
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [refreshActiveUsers]);

  // In your user card rendering:
  const renderUserCard = (user) => {
    // Check if user is active
    const active = isUserActive(user.id, user.ten_dn || user.mssv);
    
    return (
      <div className="user-card">
        <div className="flex items-center gap-2">
          <img src={user.avatar} alt={user.name} />
          <div>
            <h3>{user.ho_ten}</h3>
            {/* Add activity indicator */}
            <UserActivityIndicator isActive={active} showLabel size="sm" />
          </div>
        </div>
        
        {/* Or use badge style */}
        <UserStatusBadge isActive={active} size="sm" />
      </div>
    );
  };

  // Display active users count
  return (
    <div>
      <div className="stats">
        <div className="stat-card">
          <h4>Đang hoạt động</h4>
          <p className="text-2xl font-bold">{activeUsers.sessionCount}</p>
          <p className="text-sm text-gray-500">{activeUsers.userIds.length} người dùng</p>
        </div>
      </div>

      {/* User list with activity status */}
      <div className="users-grid">
        {users.map(user => renderUserCard(user))}
      </div>
    </div>
  );
}
