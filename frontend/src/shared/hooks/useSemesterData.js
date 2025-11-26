import { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import http from '../api/http';
import { normalizeSemesterFormat, isSameSemester, getCurrentSemesterValue } from '../lib/semester';
import sessionStorageManager from '../api/sessionStorageManager';

const OPTIONS_CACHE_KEY = 'semester_options';
// Store backend-reported current semester under a separate key to avoid
// overwriting the user-selected session key `current_semester` used by pages
// like Teacher/Monitor dashboards.
const CURRENT_CACHE_KEY = 'backend_current_semester';
const STATUS_CACHE_KEY = 'semester_status_cache';
const SELECTED_SEMESTER_KEY = 'selected_semester';

// Roles that should NOT see "Tất cả học kỳ" option
const ROLES_WITHOUT_ALL_OPTION = ['SINH_VIEN', 'GIANG_VIEN', 'LOP_TRUONG', 'GV', 'SV', 'LT'];

/**
 * Get current user role from session
 */
function getCurrentRole() {
  try {
    const session = sessionStorageManager.getSession();
    return session?.role || session?.user?.role || null;
  } catch (_) {
    return null;
  }
}

/**
 * Check if current role should see "Tất cả học kỳ" option
 */
function shouldShowAllOption(role) {
  if (!role) return false;
  const normalizedRole = role.toUpperCase().replace(/\s+/g, '_');
  return !ROLES_WITHOUT_ALL_OPTION.some(r => 
    normalizedRole.includes(r) || r.includes(normalizedRole)
  );
}

function parseJSON(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
}

function loadInitialOptions() {
  try {
    const raw = sessionStorage.getItem(OPTIONS_CACHE_KEY);
    if (!raw) return [];
    const parsed = parseJSON(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function loadInitialCurrentSemester() {
  try {
    return sessionStorage.getItem(CURRENT_CACHE_KEY) || null;
  } catch (_) {
    return null;
  }
}

function loadInitialStatusCache() {
  try {
    const raw = sessionStorage.getItem(STATUS_CACHE_KEY);
    if (!raw) return {};
    const parsed = parseJSON(raw, {});
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

/**
 * ĐƠN GIẢN HÓA: Chỉ cho phép CRUD khi học kỳ đang chọn === học kỳ active
 * @param {string} semesterValue - Học kỳ đang được chọn
 * @param {string} currentSemester - Học kỳ đang active (từ backend)
 * @returns {boolean} - true nếu có thể CRUD, false nếu chỉ xem
 */
function computeWritable(semesterValue, currentSemester) {
  // Nếu không có semesterValue, cho phép (trường hợp xem tất cả)
  if (!semesterValue) return true;
  
  // Nếu không có currentSemester từ backend, không cho phép CRUD
  if (!currentSemester) return false;
  
  // So sánh học kỳ đang chọn với học kỳ active (hỗ trợ cả format cũ và mới)
  const result = isSameSemester(semesterValue, currentSemester);
  // Debug log
  console.log('[computeWritable] semesterValue:', semesterValue, '| currentSemester:', currentSemester, '| isWritable:', result);
  return result;
}

export default function useSemesterData(semesterValue, { autoFetchStatus = true } = {}) {
  const [options, setOptions] = useState(() => loadInitialOptions());
  const [currentSemester, setCurrentSemester] = useState(() => loadInitialCurrentSemester());
  const [loadingOptions, setLoadingOptions] = useState(() => options.length === 0);
  const [optionsError, setOptionsError] = useState('');

  const [statusCache, setStatusCache] = useState(() => loadInitialStatusCache());
  const [statusLoading, setStatusLoading] = useState({});
  const [statusError, setStatusError] = useState({});

  const persistStatusCache = useCallback((nextCache) => {
    setStatusCache(nextCache);
    try {
      sessionStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(nextCache));
    } catch (_) {}
  }, []);

  const saveOptionsCache = useCallback((nextOptions) => {
    setOptions(nextOptions);
    try {
      sessionStorage.setItem(OPTIONS_CACHE_KEY, JSON.stringify(nextOptions));
    } catch (_) {}
  }, []);

  const saveCurrentSemester = useCallback((value) => {
    setCurrentSemester(value ?? null);
    try {
      if (value) {
        sessionStorage.setItem(CURRENT_CACHE_KEY, value);
      } else {
        sessionStorage.removeItem(CURRENT_CACHE_KEY);
      }
    } catch (_) {}
  }, []);

  const loadOptions = useCallback(async ({ force = false } = {}) => {
    try {
      // ALWAYS fetch current semester to get latest active semester
      // This is critical for isWritable calculation
      try {
        const currentRes = await http.get('/semesters/current');
        const current = currentRes.data?.data;
        if (current?.value) {
          saveCurrentSemester(current.value);
          console.log('[useSemesterData] Loaded currentSemester:', current.value);
        }
      } catch (err) {
        console.warn('[useSemesterData] Failed to load current semester:', err);
      }

      if (!force && options.length > 0) {
        setLoadingOptions(false);
        setOptionsError('');
        return; // Skip options fetch if cached
      }
      
      setLoadingOptions(true);
      setOptionsError('');

      const response = await http.get('/semesters/options');
      const fetchedRaw = response.data?.data || [];
      // Use labels directly from backend (already formatted as "Học kỳ X - YYYY")
      const fetched = Array.isArray(fetchedRaw) ? fetchedRaw : [];
      saveOptionsCache(fetched);
    } catch (error) {
      if (force || options.length === 0) {
        setOptionsError(error?.response?.data?.message || 'Không thể tải danh sách học kỳ');
      }
    } finally {
      setLoadingOptions(false);
    }
  }, [options.length, saveOptionsCache, saveCurrentSemester]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'semester_options_invalidate' && event.newValue) {
        try { sessionStorage.removeItem(OPTIONS_CACHE_KEY); } catch (_) {}
        try { sessionStorage.removeItem(CURRENT_CACHE_KEY); } catch (_) {}
        loadOptions({ force: true });
      }
      if (event.key === 'semester_status_invalidate' && event.newValue) {
        try { sessionStorage.removeItem(STATUS_CACHE_KEY); } catch (_) {}
        persistStatusCache({});
      }
    };

    const onBust = () => {
      try { sessionStorage.removeItem(OPTIONS_CACHE_KEY); } catch (_) {}
      try { sessionStorage.removeItem(CURRENT_CACHE_KEY); } catch (_) {}
      loadOptions({ force: true });
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('semester_options_bust', onBust);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('semester_options_bust', onBust);
    };
  }, [loadOptions, persistStatusCache]);

  const fetchStatus = useCallback(async (value, { force = false } = {}) => {
    if (!value) return null;
    if (!force && statusCache[value] !== undefined) {
      return statusCache[value];
    }

    setStatusLoading((prev) => ({ ...prev, [value]: true }));
    setStatusError((prev) => ({ ...prev, [value]: '' }));

    try {
      const response = await http.get('/semesters/status', { params: { semester: value } });
      const data = response.data?.data || null;
      const nextCache = { ...statusCache, [value]: data };
      persistStatusCache(nextCache);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Không tải được trạng thái học kỳ';
      setStatusError((prev) => ({ ...prev, [value]: message }));
      const nextCache = { ...statusCache };
      delete nextCache[value];
      persistStatusCache(nextCache);
      throw error;
    } finally {
      setStatusLoading((prev) => ({ ...prev, [value]: false }));
    }
  }, [persistStatusCache, statusCache]);

  useEffect(() => {
    if (autoFetchStatus && semesterValue) {
      if (statusCache[semesterValue] === undefined) {
        fetchStatus(semesterValue).catch(() => {});
      }
    }
  }, [autoFetchStatus, semesterValue, fetchStatus, statusCache]);

  const status = semesterValue ? statusCache[semesterValue] || null : null;
  const isWritable = useMemo(() => computeWritable(semesterValue, currentSemester), [semesterValue, currentSemester]);

  // Filter options based on user role
  const userRole = getCurrentRole();
  const showAllOption = shouldShowAllOption(userRole);
  
  const filteredOptions = useMemo(() => {
    if (showAllOption) {
      return options;
    }
    // Filter out empty/null value option ("Tất cả học kỳ")
    return options.filter(opt => opt.value !== '' && opt.value !== null && opt.value !== undefined);
  }, [options, showAllOption]);

  return {
    options: filteredOptions, // Filtered by role
    allOptions: options, // Raw options (for admin use)
    currentSemester,
    loading: loadingOptions,
    error: optionsError,
    refresh: () => loadOptions({ force: true }),

    status,
    isWritable,
    showAllOption, // For UI to know if "Tất cả" is available
    statusLoading: semesterValue ? !!statusLoading[semesterValue] : false,
    statusError: semesterValue ? (statusError[semesterValue] || '') : '',
    fetchStatus,
    refreshStatus: () => (semesterValue ? fetchStatus(semesterValue, { force: true }) : Promise.resolve(null)),

    statusCache,
    setStatusCache: persistStatusCache
  };
}

export function invalidateSemesterDataCache() {
  try { sessionStorage.removeItem(OPTIONS_CACHE_KEY); } catch (_) {}
  try { sessionStorage.removeItem(CURRENT_CACHE_KEY); } catch (_) {}
  try { sessionStorage.removeItem(STATUS_CACHE_KEY); } catch (_) {}
  try { localStorage.setItem('semester_options_invalidate', String(Date.now())); } catch (_) {}
  try { localStorage.setItem('semester_status_invalidate', String(Date.now())); } catch (_) {}
  try { window.dispatchEvent(new Event('semester_options_bust')); } catch (_) {}
}

/**
 * Save selected semester globally and broadcast to other components
 * Call this when user changes semester in any dropdown
 */
export function setGlobalSemester(value) {
  try {
    if (value) {
      sessionStorage.setItem(SELECTED_SEMESTER_KEY, value);
    } else {
      sessionStorage.removeItem(SELECTED_SEMESTER_KEY);
    }
    // Broadcast to other components in same tab
    window.dispatchEvent(new CustomEvent('semester_selection_changed', { detail: { semester: value } }));
    console.log('[setGlobalSemester] Broadcast semester change:', value);
  } catch (err) {
    console.warn('[setGlobalSemester] Failed to save:', err);
  }
}

/**
 * Get globally selected semester
 */
export function getGlobalSemester() {
  try {
    return sessionStorage.getItem(SELECTED_SEMESTER_KEY) || null;
  } catch (_) {
    return null;
  }
}

/**
 * Hook to sync with global semester changes
 * Returns current global semester and updates when it changes
 */
export function useGlobalSemesterSync(localSemester, setLocalSemester) {
  useEffect(() => {
    const handleChange = (event) => {
      const newSemester = event.detail?.semester;
      if (newSemester !== localSemester) {
        console.log('[useGlobalSemesterSync] Syncing to:', newSemester);
        setLocalSemester(newSemester);
      }
    };

    window.addEventListener('semester_selection_changed', handleChange);
    return () => window.removeEventListener('semester_selection_changed', handleChange);
  }, [localSemester, setLocalSemester]);
}

