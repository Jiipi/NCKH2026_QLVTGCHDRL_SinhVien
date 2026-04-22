/**
 * usePermissions Hook - Unit tests
 * FE-TEST-001: Permission hook tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePermissions } from '../usePermissions';

// ── Mock dependencies ───────────────────────────────────────────────

const mockGet = jest.fn();

jest.mock('../../api/http', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

jest.mock('../../api/sessionStorageManager', () => ({
  __esModule: true,
  default: {
    getSession: () => ({ user: { id: 'u1' }, role: 'ADMIN' }),
    getTabId: () => 'tab-1',
    onSessionChange: () => () => {},
  },
}));

// ── Tests ───────────────────────────────────────────────────────────

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Default: return some permissions from the API
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: { permissions: ['users.read', 'users.write', 'activities.read'] },
      },
    });
  });

  it('fetches permissions on mount and sets them', async () => {
    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.permissions).toEqual(['users.read', 'users.write', 'activities.read']);
    expect(result.current.error).toBeNull();
  });

  describe('hasPermission', () => {
    it('returns true for a granted permission', async () => {
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasPermission('users.read')).toBe(true);
    });

    it('returns false for a missing permission', async () => {
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasPermission('roles.delete')).toBe(false);
    });

    it('returns true when null/undefined (no permission required)', async () => {
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasPermission(null)).toBe(true);
      expect(result.current.hasPermission(undefined)).toBe(true);
    });

    it('wildcard * grants everything', async () => {
      mockGet.mockResolvedValue({
        data: { success: true, data: { permissions: ['*'] } },
      });
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasPermission('anything.whatever')).toBe(true);
    });

    it('resource wildcard users.* grants all users sub-permissions', async () => {
      mockGet.mockResolvedValue({
        data: { success: true, data: { permissions: ['users.*'] } },
      });
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasPermission('users.delete')).toBe(true);
      expect(result.current.hasPermission('activities.read')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('returns true if at least one permission matches', async () => {
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasAnyPermission(['users.read', 'roles.admin'])).toBe(true);
    });

    it('returns false if no permission matches', async () => {
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasAnyPermission(['roles.admin', 'semesters.delete'])).toBe(false);
    });

    it('returns true for null/empty array', async () => {
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasAnyPermission(null)).toBe(true);
      expect(result.current.hasAnyPermission([])).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('returns true only when ALL permissions match', async () => {
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasAllPermissions(['users.read', 'users.write'])).toBe(true);
    });

    it('returns false if any permission is missing', async () => {
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasAllPermissions(['users.read', 'roles.admin'])).toBe(false);
    });

    it('returns true for null/empty array', async () => {
      const { result } = renderHook(() => usePermissions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasAllPermissions(null)).toBe(true);
      expect(result.current.hasAllPermissions([])).toBe(true);
    });
  });

  describe('error handling', () => {
    it('sets error when API call fails', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });
});
