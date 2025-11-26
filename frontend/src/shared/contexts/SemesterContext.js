/**
 * SemesterContext - Global Semester Selection Management
 * 
 * Features:
 * - Đồng bộ học kỳ giữa các form trong cùng 1 role
 * - Ẩn "Tất cả học kỳ" cho role SV, GV, LT (chỉ hiện cho Admin)
 * - Persist semester selection per role in sessionStorage
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import http from '../api/http';
import { normalizeSemesterFormat, isSameSemester, getCurrentSemesterValue } from '../lib/semester';
import sessionStorageManager from '../api/sessionStorageManager';

const SemesterContext = createContext(null);

// Storage keys
const SELECTED_SEMESTER_KEY = 'selected_semester';
const OPTIONS_CACHE_KEY = 'semester_options';
const CURRENT_SEMESTER_KEY = 'backend_current_semester';

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

/**
 * Load saved semester from sessionStorage
 */
function loadSavedSemester() {
  try {
    return sessionStorage.getItem(SELECTED_SEMESTER_KEY) || null;
  } catch (_) {
    return null;
  }
}

/**
 * Save semester to sessionStorage
 */
function saveSemester(value) {
  try {
    if (value) {
      sessionStorage.setItem(SELECTED_SEMESTER_KEY, value);
    } else {
      sessionStorage.removeItem(SELECTED_SEMESTER_KEY);
    }
    // Broadcast to other components
    window.dispatchEvent(new CustomEvent('semester_changed', { detail: { semester: value } }));
  } catch (_) {}
}

export function SemesterProvider({ children }) {
  const [options, setOptions] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null); // Backend active semester
  const [selectedSemester, setSelectedSemesterState] = useState(() => loadSavedSemester());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(() => getCurrentRole());

  // Update role when session changes
  useEffect(() => {
    const handleSessionChange = () => {
      setUserRole(getCurrentRole());
    };
    
    window.addEventListener('storage', handleSessionChange);
    window.addEventListener('session_changed', handleSessionChange);
    
    return () => {
      window.removeEventListener('storage', handleSessionChange);
      window.removeEventListener('session_changed', handleSessionChange);
    };
  }, []);

  // Load options and current semester from backend
  const loadData = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError('');

      // Fetch current semester
      try {
        const currentRes = await http.get('/semesters/current');
        const current = currentRes.data?.data;
        if (current?.value) {
          setCurrentSemester(current.value);
          sessionStorage.setItem(CURRENT_SEMESTER_KEY, current.value);
        }
      } catch (err) {
        console.warn('[SemesterContext] Failed to load current semester:', err);
      }

      // Fetch options
      const response = await http.get('/semesters/options');
      const fetchedRaw = response.data?.data || [];
      const fetched = Array.isArray(fetchedRaw) ? fetchedRaw : [];
      setOptions(fetched);
      
      // Cache options
      try {
        sessionStorage.setItem(OPTIONS_CACHE_KEY, JSON.stringify(fetched));
      } catch (_) {}

    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách học kỳ');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set semester with persistence
  const setSelectedSemester = useCallback((value) => {
    setSelectedSemesterState(value);
    saveSemester(value);
  }, []);

  // Listen for semester changes from other components
  useEffect(() => {
    const handleSemesterChange = (event) => {
      const newSemester = event.detail?.semester;
      if (newSemester !== selectedSemester) {
        setSelectedSemesterState(newSemester);
      }
    };

    window.addEventListener('semester_changed', handleSemesterChange);
    return () => window.removeEventListener('semester_changed', handleSemesterChange);
  }, [selectedSemester]);

  // Filter options based on role
  const filteredOptions = useMemo(() => {
    const showAll = shouldShowAllOption(userRole);
    
    if (showAll) {
      return options;
    }
    
    // Filter out empty value option ("Tất cả học kỳ")
    return options.filter(opt => opt.value !== '' && opt.value !== null);
  }, [options, userRole]);

  // Auto-select current semester if no selection and role doesn't allow "all"
  useEffect(() => {
    const showAll = shouldShowAllOption(userRole);
    
    if (!showAll && !selectedSemester && currentSemester) {
      // Auto-select current active semester
      setSelectedSemester(currentSemester);
    } else if (!showAll && !selectedSemester && filteredOptions.length > 0) {
      // Fallback to first option
      const firstOption = filteredOptions.find(opt => opt.value);
      if (firstOption) {
        setSelectedSemester(firstOption.value);
      }
    }
  }, [userRole, selectedSemester, currentSemester, filteredOptions, setSelectedSemester]);

  // Compute isWritable
  const isWritable = useMemo(() => {
    if (!selectedSemester) return true; // "Tất cả" mode - allow for admin
    if (!currentSemester) return false;
    return isSameSemester(selectedSemester, currentSemester);
  }, [selectedSemester, currentSemester]);

  const value = useMemo(() => ({
    // Options (filtered by role)
    options: filteredOptions,
    allOptions: options, // Raw options for admin
    
    // Current active semester from backend
    currentSemester,
    
    // Selected semester (user choice)
    selectedSemester,
    setSelectedSemester,
    
    // State
    loading,
    error,
    
    // Permissions
    isWritable,
    showAllOption: shouldShowAllOption(userRole),
    userRole,
    
    // Actions
    refresh: () => loadData(true),
  }), [
    filteredOptions, 
    options, 
    currentSemester, 
    selectedSemester, 
    setSelectedSemester, 
    loading, 
    error, 
    isWritable, 
    userRole,
    loadData
  ]);

  return (
    <SemesterContext.Provider value={value}>
      {children}
    </SemesterContext.Provider>
  );
}

/**
 * Hook to use semester context
 */
export function useSemesterContext() {
  const context = useContext(SemesterContext);
  if (!context) {
    throw new Error('useSemesterContext must be used within SemesterProvider');
  }
  return context;
}

/**
 * Hook for components that need semester selection
 * Provides backward compatibility with existing useSemesterData pattern
 */
export function useGlobalSemester() {
  const context = useContext(SemesterContext);
  
  // If no provider, return standalone version for backward compatibility
  if (!context) {
    console.warn('[useGlobalSemester] No SemesterProvider found, using standalone mode');
    return {
      options: [],
      currentSemester: null,
      selectedSemester: loadSavedSemester() || getCurrentSemesterValue(),
      setSelectedSemester: saveSemester,
      loading: false,
      error: '',
      isWritable: true,
      showAllOption: true,
      refresh: () => {},
    };
  }
  
  return context;
}

export default SemesterContext;
