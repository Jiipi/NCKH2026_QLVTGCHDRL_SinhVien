import React from 'react';
import { userProfileApi } from '../../features/users/services/userProfileApi';
import sessionStorageManager from '../../shared/api/sessionStorageManager';
import { normalizeRole } from '../../shared/lib/role';
import { useSessionTracking } from '../../shared/hooks/useSessionTracking';
import { useAppStore } from '../../shared/store';

export function useAppLifecycle() {
  const [hydrated, setHydrated] = React.useState(false);
  const token = useAppStore(s => s.token);

  useSessionTracking(!!token);

  React.useLayoutEffect(() => {
    try {
      const session = sessionStorageManager.getSession();
      if (session && session.token) {
        const token = session.token;
        const user = session.user;
        const derivedRole = normalizeRole(session.role);
        if (token && derivedRole) {
          useAppStore.getState().setAuth({ token, user: user as any, role: derivedRole });
          console.log('[Hydration] Set auth from sessionStorage (tab-specific)', { derivedRole, tabId: sessionStorageManager.getTabId() });
        } else {
          console.log('[Hydration] Session data incomplete', { tokenPresent: !!token, derivedRole });
        }
      } else {
        console.log('[Hydration] No session found for tab:', sessionStorageManager.getTabId());
      }
    } catch (e) {
      console.warn('[Hydration] Failed to load session data', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    const handleRoleChange = async (event: StorageEvent) => {
      if (event.key === '__role_permissions_updated_at__') {
        console.log('⚡️ Detected role permission change, forcing profile refresh...');
        const token = sessionStorageManager.getToken();
        if (!token) return;

        try {
          const payload = await userProfileApi.getUsersProfile();
          if (payload) {
            const currentSession = sessionStorageManager.getSession() || {};
            sessionStorageManager.saveSession({ ...currentSession, token, user: payload, role: payload.vai_tro?.ten_vt || payload.role });
            window.location.reload();
          }
        } catch (err) {
          console.error('Failed to refresh profile after role change, logging out as a security measure.', err);
          sessionStorageManager.clearSession();
          window.location.href = '/login';
        }
      }
    };

    window.addEventListener('storage', handleRoleChange);
    return () => {
      window.removeEventListener('storage', handleRoleChange);
    };
  }, []);

  return { hydrated };
}
