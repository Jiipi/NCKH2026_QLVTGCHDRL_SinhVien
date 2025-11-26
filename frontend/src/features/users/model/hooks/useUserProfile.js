import { useState, useEffect } from 'react';
import http from '../../../../shared/services/api/client';
import sessionStorageManager from '../../../../shared/services/storage/sessionStorageManager';
import { useAppStore } from '../../../../shared/store/useAppStore';

export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const { user: authUser, setAuth } = useAppStore();

  useEffect(() => {
    const session = sessionStorageManager.getSession();
    if (session?.user) {
      setProfile(session.user);
    } else {
      const token = sessionStorageManager.getToken();
      if (token) {
        http.get('/auth/profile')
          .then(res => {
            const payload = res.data?.data || res.data;
            if (payload) {
              setProfile(payload);
              setAuth({ token, user: payload, role: payload.role || payload.roleCode });
            }
          })
          .catch(err => {
            if (err.response?.status === 401) {
              sessionStorageManager.clearSession();
              setProfile(null);
            }
          });
      }
    }
  }, [authUser, setAuth]);

  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail?.profile) {
        setProfile(event.detail.profile);
        const currentSession = sessionStorageManager.getSession();
        if (currentSession) {
          sessionStorageManager.saveSession({ ...currentSession, user: event.detail.profile });
        }
      }
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  return profile;
}

