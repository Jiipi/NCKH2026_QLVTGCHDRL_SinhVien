import { useCallback, useEffect, useMemo, useState } from 'react';
import http from '../shared/api/http';

const OPTIONS_CACHE_KEY = 'semester_options';
// Store backend-reported current semester under a separate key to avoid
// overwriting the user-selected session key `current_semester` used by pages
// like Teacher/Monitor dashboards.
const CURRENT_CACHE_KEY = 'backend_current_semester';
const STATUS_CACHE_KEY = 'semester_status_cache';

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

function computeWritable(statusData, semesterValue) {
  if (!semesterValue) return true;
  if (!statusData) return true;

  const { semester, state } = statusData;
  const activeValue = semester ? `${semester.semester}-${semester.year}` : null;
  if (activeValue && activeValue === semesterValue) {
    return true;
  }

  const st = state?.state;
  if (!st) return true;
  if (st === 'ACTIVE' || st === 'CLOSING') return true;
  if (st === 'LOCKED_SOFT' || st === 'LOCKED_HARD' || st === 'ARCHIVED') return false;
  return true;
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
      if (!force && options.length > 0) {
        setLoadingOptions(false);
        setOptionsError('');
      } else {
        setLoadingOptions(true);
        setOptionsError('');
      }

      const response = await http.get('/semesters/options');
      const fetchedRaw = response.data?.data || [];
      // Use labels directly from backend (already formatted as "Học kỳ X - YYYY")
      const fetched = Array.isArray(fetchedRaw) ? fetchedRaw : [];
      saveOptionsCache(fetched);

      try {
        const currentRes = await http.get('/semesters/current');
        const current = currentRes.data?.data;
        if (current?.value) {
          saveCurrentSemester(current.value);
        }
      } catch (_) {}
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
  const isWritable = useMemo(() => computeWritable(status, semesterValue), [status, semesterValue]);

  return {
    options,
    currentSemester,
    loading: loadingOptions,
    error: optionsError,
    refresh: () => loadOptions({ force: true }),

    status,
    isWritable,
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

