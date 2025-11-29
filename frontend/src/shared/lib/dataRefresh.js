/**
 * Data Refresh Utility
 * Provides cross-component data refresh mechanism using custom events
 * 
 * Usage:
 * 1. Emit event when data changes: emitDataChange('activities')
 * 2. Listen for changes in hooks: useDataChangeListener('activities', refreshCallback)
 */

import { useEffect, useRef, useCallback } from 'react';

// Event types for different data domains
export const DATA_CHANGE_EVENTS = {
  ACTIVITIES: 'data:activities:changed',
  REGISTRATIONS: 'data:registrations:changed',
  APPROVALS: 'data:approvals:changed',
  SCORES: 'data:scores:changed',
  ACTIVITY_TYPES: 'data:activity-types:changed',
  ATTENDANCE: 'data:attendance:changed',
  ALL: 'data:all:changed'
};

/**
 * Emit a data change event
 * @param {string} type - Type of data that changed (activities, registrations, etc.)
 * @param {object} detail - Optional detail object with more info
 */
export function emitDataChange(type, detail = {}) {
  const eventName = DATA_CHANGE_EVENTS[type?.toUpperCase()] || DATA_CHANGE_EVENTS.ALL;
  
  try {
    const event = new CustomEvent(eventName, { 
      detail: { 
        type, 
        timestamp: Date.now(),
        ...detail 
      },
      bubbles: true 
    });
    window.dispatchEvent(event);
    
    // Also emit ALL event for components that want to refresh on any change
    if (eventName !== DATA_CHANGE_EVENTS.ALL) {
      const allEvent = new CustomEvent(DATA_CHANGE_EVENTS.ALL, { 
        detail: { 
          type, 
          timestamp: Date.now(),
          ...detail 
        },
        bubbles: true 
      });
      window.dispatchEvent(allEvent);
    }
    
    // Store timestamp in sessionStorage for cross-tab sync
    try {
      sessionStorage.setItem(`${type}_UPDATED_AT`, Date.now().toString());
    } catch (_) {}
    
    console.log(`[DataRefresh] Emitted: ${eventName}`, detail);
  } catch (err) {
    console.warn('[DataRefresh] Could not emit event:', err);
  }
}

/**
 * Shorthand functions for common data types
 */
export const emitActivitiesChange = (detail) => emitDataChange('ACTIVITIES', detail);
export const emitRegistrationsChange = (detail) => emitDataChange('REGISTRATIONS', detail);
export const emitApprovalsChange = (detail) => emitDataChange('APPROVALS', detail);
export const emitScoresChange = (detail) => emitDataChange('SCORES', detail);
export const emitActivityTypesChange = (detail) => emitDataChange('ACTIVITY_TYPES', detail);
export const emitAttendanceChange = (detail) => emitDataChange('ATTENDANCE', detail);

/**
 * React hook to listen for data changes and auto-refresh
 * @param {string|string[]} types - Type(s) of data to listen for
 * @param {function} callback - Callback to execute when data changes
 * @param {object} options - Options like debounce time
 */
export function useDataChangeListener(types, callback, options = {}) {
  const { debounceMs = 300, enabled = true } = options;
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);
  
  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    }, debounceMs);
  }, [debounceMs]);
  
  useEffect(() => {
    if (!enabled) return;
    
    const typesArray = Array.isArray(types) ? types : [types];
    const eventNames = typesArray.map(t => 
      DATA_CHANGE_EVENTS[t?.toUpperCase()] || DATA_CHANGE_EVENTS.ALL
    );
    
    // Remove duplicates
    const uniqueEvents = [...new Set(eventNames)];
    
    const handleChange = (event) => {
      console.log('[DataRefresh] Received:', event.type, event.detail);
      debouncedCallback();
    };
    
    // Add listeners
    uniqueEvents.forEach(eventName => {
      window.addEventListener(eventName, handleChange);
    });
    
    // Also listen for storage events (cross-tab sync)
    const handleStorage = (e) => {
      const relevantKeys = typesArray.map(t => `${t}_UPDATED_AT`);
      if (relevantKeys.includes(e?.key)) {
        debouncedCallback();
      }
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      uniqueEvents.forEach(eventName => {
        window.removeEventListener(eventName, handleChange);
      });
      window.removeEventListener('storage', handleStorage);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [types, debouncedCallback, enabled]);
}

/**
 * Hook to listen for all data changes
 * @param {function} callback - Callback to execute when any data changes
 * @param {object} options - Options like debounce time
 */
export function useAnyDataChangeListener(callback, options = {}) {
  return useDataChangeListener('ALL', callback, options);
}

/**
 * Hook for auto-refresh with polling
 * Useful for cross-user/cross-role sync where events don't propagate
 * 
 * @param {function} callback - Function to call on each refresh
 * @param {object} options - Configuration options
 * @param {number} options.intervalMs - Polling interval in ms (default: 30000 = 30s)
 * @param {boolean} options.enabled - Whether polling is enabled (default: true)
 * @param {boolean} options.refreshOnFocus - Refresh when window gains focus (default: true)
 * @param {boolean} options.refreshOnVisible - Refresh when tab becomes visible (default: true)
 */
export function useAutoRefresh(callback, options = {}) {
  const { 
    intervalMs = 30000, 
    enabled = true,
    refreshOnFocus = true,
    refreshOnVisible = true
  } = options;
  
  const callbackRef = useRef(callback);
  const intervalRef = useRef(null);
  const lastRefreshRef = useRef(Date.now());
  
  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const doRefresh = useCallback(() => {
    const now = Date.now();
    // Prevent refresh if last refresh was less than 5 seconds ago
    if (now - lastRefreshRef.current < 5000) {
      return;
    }
    lastRefreshRef.current = now;
    
    if (callbackRef.current) {
      console.log('[AutoRefresh] Refreshing data...');
      callbackRef.current();
    }
  }, []);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Set up polling interval
    intervalRef.current = setInterval(doRefresh, intervalMs);
    
    // Refresh on window focus
    const handleFocus = () => {
      if (refreshOnFocus) {
        console.log('[AutoRefresh] Window focused, refreshing...');
        doRefresh();
      }
    };
    
    // Refresh on visibility change
    const handleVisibility = () => {
      if (refreshOnVisible && document.visibilityState === 'visible') {
        console.log('[AutoRefresh] Tab visible, refreshing...');
        doRefresh();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, intervalMs, refreshOnFocus, refreshOnVisible, doRefresh]);
}

export default {
  DATA_CHANGE_EVENTS,
  emitDataChange,
  emitActivitiesChange,
  emitRegistrationsChange,
  emitApprovalsChange,
  emitScoresChange,
  emitActivityTypesChange,
  emitAttendanceChange,
  useDataChangeListener,
  useAnyDataChangeListener,
  useAutoRefresh
};
