/**
 * Axios Interceptor for Permission Management
 * Tự động xử lý 403 errors và refresh permissions
 * 
 * Setup:
 * Import file này trong App.js hoặc index.js để activate interceptor
 * 
 * import './utils/permissionInterceptor';
 */

const axiosInstance = require('./axiosInstance');

// Event để notify các component khi có 403
const PERMISSION_DENIED_EVENT = 'permission-denied';

/**
 * Dispatch custom event khi có 403
 */
function notifyPermissionDenied(error) {
  const event = new CustomEvent(PERMISSION_DENIED_EVENT, {
    detail: {
      url: error.config?.url,
      method: error.config?.method,
      requiredPermission: error.response?.data?.requiredPermission,
      message: error.response?.data?.message,
    },
  });
  window.dispatchEvent(event);
}

/**
 * Refresh permissions từ backend
 */
async function refreshPermissions() {
  try {
    const response = await axiosInstance.get('/api/auth/permissions');
    if (response.data.success) {
      const permissions = response.data.data.permissions || [];
      localStorage.setItem('user_permissions', JSON.stringify(permissions));
      
      // Dispatch event để notify các component
      const event = new CustomEvent('permissions-updated', {
        detail: { permissions },
      });
      window.dispatchEvent(event);
      
      return permissions;
    }
  } catch (error) {
    console.error('Error refreshing permissions:', error);
  }
  return null;
}

/**
 * Setup response interceptor
 */
axiosInstance.interceptors.response.use(
  function(response) {
    // Request thành công - không làm gì
    return response;
  },
  function(error) {
    // Kiểm tra nếu là 403 Forbidden
    if (error.response && error.response.status === 403) {
      console.warn('⛔ Permission denied:', error.response.data);
      
      // Notify các component
      notifyPermissionDenied(error);
      
      // Refresh permissions để cập nhật UI
      refreshPermissions().then(function(newPermissions) {
        if (newPermissions) {
          console.log('✅ Permissions refreshed after 403:', newPermissions);
        }
      });
      
      // Show toast notification (nếu có toast library)
      if (window.toast && window.toast.error) {
        window.toast.error(
          error.response.data?.message || 'Bạn không có quyền thực hiện thao tác này'
        );
      }
    }
    
    // Kiểm tra nếu là 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.warn('🔒 Unauthorized - redirecting to login');
      
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user_permissions');
      localStorage.removeItem('user');
      
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function để listen permission denied events
 * Usage trong component:
 * 
 * useEffect(() => {
 *   const handlePermissionDenied = (event) => {
 *     console.log('Permission denied:', event.detail);
 *     // Hide UI, show message, etc.
 *   };
 *   
 *   window.addEventListener('permission-denied', handlePermissionDenied);
 *   return () => window.removeEventListener('permission-denied', handlePermissionDenied);
 * }, []);
 */
function onPermissionDenied(callback) {
  window.addEventListener(PERMISSION_DENIED_EVENT, callback);
  
  return function cleanup() {
    window.removeEventListener(PERMISSION_DENIED_EVENT, callback);
  };
}

/**
 * Helper function để listen permissions updated events
 */
function onPermissionsUpdated(callback) {
  window.addEventListener('permissions-updated', callback);
  
  return function cleanup() {
    window.removeEventListener('permissions-updated', callback);
  };
}

module.exports = {
  onPermissionDenied,
  onPermissionsUpdated,
  refreshPermissions,
};
