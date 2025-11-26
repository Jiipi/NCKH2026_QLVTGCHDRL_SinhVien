/**
 * ================================================================
 * CUSTOM HOOK: useActivities
 * ================================================================
 * Centralized hook for fetching and filtering activities
 * Được sử dụng bởi TẤT CẢ các role để đảm bảo consistency
 * ================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import http from '../api/http';

// ================================================================
// HELPER FUNCTIONS (inline để tránh circular dependencies)
// ================================================================

/**
 * Normalize activity data to consistent format
 */
const normalizeActivity = (activity) => {
  if (!activity) return null;
  const data = activity.hoat_dong || activity;
  return {
    ...data,
    id: data.id || data.ma_hd,
    ma_hd: data.ma_hd || data.id,
    ten_hd: data.ten_hd || '',
    mo_ta: data.mo_ta || '',
    ngay_bd: data.ngay_bd,
    ngay_kt: data.ngay_kt,
    trang_thai: data.trang_thai || 'cho_duyet',
    is_class_activity: data.is_class_activity || false,
    hoc_ky: data.hoc_ky || '',
    loai_hd: data.loai_hd || null,
    diem_rl: data.diem_rl || 0
  };
};

/**
 * Filter available activities (open for registration)
 */
const filterAvailableActivities = (activities, semester, userRegistrations = []) => {
  const registeredIds = new Set(userRegistrations.map(r => r.ma_hd || r.activity_id));
  
  return activities.filter(a => {
    // Not already registered
    if (registeredIds.has(a.ma_hd || a.id)) return false;
    
    // Must be open for registration
    if (a.trang_thai !== 'dang_mo' && a.trang_thai !== 'open') return false;
    
    // Semester filter
    if (semester && a.hoc_ky && a.hoc_ky !== semester) return false;
    
    return true;
  });
};

/**
 * Filter upcoming activities
 */
const filterUpcomingActivities = (activities, semester) => {
  const now = new Date();
  
  return activities.filter(a => {
    // Semester filter
    if (semester && a.hoc_ky && a.hoc_ky !== semester) return false;
    
    // Must start in the future
    if (a.ngay_bd) {
      const startDate = new Date(a.ngay_bd);
      if (startDate <= now) return false;
    }
    
    return true;
  });
};

/**
 * Filter activities by status
 */
const filterActivitiesByStatus = (activities, status, semester) => {
  return activities.filter(a => {
    if (semester && a.hoc_ky && a.hoc_ky !== semester) return false;
    if (status === 'all') return true;
    return a.trang_thai === status;
  });
};

/**
 * Count activities by status
 */
const countActivitiesByStatus = (activities, semester) => {
  const filtered = semester 
    ? activities.filter(a => !a.hoc_ky || a.hoc_ky === semester)
    : activities;
    
  return {
    total: filtered.length,
    cho_duyet: filtered.filter(a => a.trang_thai === 'cho_duyet').length,
    da_duyet: filtered.filter(a => a.trang_thai === 'da_duyet').length,
    dang_mo: filtered.filter(a => a.trang_thai === 'dang_mo').length,
    da_ket_thuc: filtered.filter(a => a.trang_thai === 'da_ket_thuc').length
  };
};

/**
 * Count class activities
 */
const countClassActivities = (activities, semester) => {
  return activities.filter(a => {
    if (semester && a.hoc_ky && a.hoc_ky !== semester) return false;
    return a.is_class_activity;
  }).length;
};

/**
 * Hook chính để fetch và filter activities
 * @param {Object} options - Configuration options
 * @param {string} options.semester - Học kỳ cần filter
 * @param {string} options.role - Role của user (student, monitor, teacher, admin)
 * @param {boolean} options.autoFetch - Tự động fetch khi mount
 * @returns {Object} - Activities data and methods
 */
export const useActivities = ({ 
  semester, 
  role = 'student',
  autoFetch = true 
} = {}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  /**
   * Fetch activities from backend
   */
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        semesterValue: semester || undefined,
        limit: 'all'
      };
      
      console.log(`[useActivities] Fetching for role: ${role}, semester: ${semester}`);
      
      // ✅ Sử dụng CORE endpoint với scope middleware
      const response = await http.get('/core/activities', { params });
      
      // Normalize response structure
      const responseData = response.data?.data || response.data || {};
      const items = responseData.items || responseData.data || responseData || [];
      const activitiesArray = Array.isArray(items) ? items : [];
      
      // Normalize all activities
      const normalized = activitiesArray.map(normalizeActivity);
      
      console.log(`[useActivities] Fetched ${normalized.length} activities`);
      
      setActivities(normalized);
      setLastFetch(new Date());
      
      return normalized;
    } catch (err) {
      console.error('[useActivities] Error fetching:', err);
      setError(err.message || 'Không thể tải danh sách hoạt động');
      setActivities([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [semester, role]);

  /**
   * Auto fetch on mount and when semester changes
   */
  useEffect(() => {
    if (autoFetch && semester) {
      fetchActivities();
    }
  }, [semester, autoFetch, fetchActivities]);

  /**
   * Get activities filtered by various criteria
   */
  const getFiltered = useCallback((filterType, additionalParams = {}) => {
    switch (filterType) {
      case 'available':
        // Hoạt động có sẵn để đăng ký
        return filterAvailableActivities(
          activities, 
          semester, 
          additionalParams.userRegistrations || []
        );
      
      case 'upcoming':
        // Hoạt động sắp diễn ra
        return filterUpcomingActivities(activities, semester);
      
      case 'class':
        // Chỉ hoạt động lớp
        return activities.filter(a => 
          a.is_class_activity && (!semester || a.hoc_ky === semester)
        );
      
      case 'status':
        // Lọc theo trạng thái
        return filterActivitiesByStatus(
          activities, 
          additionalParams.status || 'all',
          semester
        );
      
      default:
        return activities;
    }
  }, [activities, semester]);

  /**
   * Get counts by status
   */
  const getCounts = useCallback(() => {
    return countActivitiesByStatus(activities, semester);
  }, [activities, semester]);

  /**
   * Get count of class activities
   */
  const getClassCount = useCallback(() => {
    return countClassActivities(activities, semester);
  }, [activities, semester]);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    return fetchActivities();
  }, [fetchActivities]);

  return {
    // Data
    activities,
    loading,
    error,
    lastFetch,
    
    // Methods
    fetchActivities,
    refresh,
    getFiltered,
    getCounts,
    getClassCount
  };
};

/**
 * ================================================================
 * CUSTOM HOOK: useMyActivities (Personal Registrations)
 * ================================================================
 */
export const useMyActivities = ({ semester, autoFetch = true } = {}) => {
  const [myActivities, setMyActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { semester: semester || undefined };
      
      const response = await http.get('/core/dashboard/activities/me', { params });
      
      const data = response.data?.success && Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
      
      setMyActivities(data);
      return data;
    } catch (err) {
      console.error('[useMyActivities] Error:', err);
      setError(err.message);
      setMyActivities([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    if (autoFetch && semester) {
      fetchMyActivities();
    }
  }, [semester, autoFetch, fetchMyActivities]);

  /**
   * Filter by registration status
   */
  const getByStatus = useCallback((status) => {
    if (status === 'all') return myActivities;
    
    return myActivities.filter(item => {
      const st = (item.trang_thai_dk || item.status || '').toLowerCase();
      return st === status;
    });
  }, [myActivities]);

  return {
    myActivities,
    loading,
    error,
    fetchMyActivities,
    getByStatus,
    
    // Convenience getters
    pending: getByStatus('cho_duyet'),
    approved: getByStatus('da_duyet'),
    joined: getByStatus('da_tham_gia'),
    rejected: getByStatus('tu_choi')
  };
};

export default useActivities;
