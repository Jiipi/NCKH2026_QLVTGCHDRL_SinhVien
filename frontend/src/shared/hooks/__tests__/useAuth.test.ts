/**
 * useAuth Hook - Unit tests
 * FE-TEST-001: Guard route / auth hook tests
 */

import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

// ── Mock authApi ────────────────────────────────────────────────────

const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockRegister = jest.fn();
const mockGetMe = jest.fn();
const mockForgotPassword = jest.fn();
const mockResetPassword = jest.fn();
const mockChangePassword = jest.fn();

jest.mock('../../api/repositories', () => ({
  authApi: {
    login: (...args: unknown[]) => mockLogin(...args),
    logout: (...args: unknown[]) => mockLogout(...args),
    register: (...args: unknown[]) => mockRegister(...args),
    getMe: (...args: unknown[]) => mockGetMe(...args),
    forgotPassword: (...args: unknown[]) => mockForgotPassword(...args),
    resetPassword: (...args: unknown[]) => mockResetPassword(...args),
    changePassword: (...args: unknown[]) => mockChangePassword(...args),
  },
  LoginDto: class {},
  RegisterDto: class {},
  LoginResponse: class {},
}));

// ── Tests ───────────────────────────────────────────────────────────

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialises with null user, not loading, no error', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('login', () => {
    it('sets user on successful login', async () => {
      const mockUser = { id: '1', ho_ten: 'Admin' };
      mockLogin.mockResolvedValue({ token: 'tok', user: mockUser });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.login({ maso: 'admin', password: '123' } as never);
        expect(response.token).toBe('tok');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('sets error on failed login', async () => {
      const err = new Error('Invalid credentials');
      mockLogin.mockRejectedValue(err);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.login({ maso: 'bad', password: '123' } as never);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe(err);
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user on logout', async () => {
      const mockUser = { id: '1', ho_ten: 'Admin' };
      mockLogin.mockResolvedValue({ token: 'tok', user: mockUser });
      mockLogout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ maso: 'admin', password: '123' } as never);
      });
      expect(result.current.user).toEqual(mockUser);

      await act(async () => {
        await result.current.logout();
      });
      expect(result.current.user).toBeNull();
    });
  });

  describe('getMe', () => {
    it('fetches and sets the current user', async () => {
      const mockUser = { id: '2', ho_ten: 'Student' };
      mockGetMe.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const user = await result.current.getMe();
        expect(user).toEqual(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('changePassword', () => {
    it('calls changePassword API without changing user state', async () => {
      mockChangePassword.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.changePassword('old', 'new');
      });

      expect(mockChangePassword).toHaveBeenCalledWith('old', 'new');
      expect(result.current.loading).toBe(false);
    });
  });
});
