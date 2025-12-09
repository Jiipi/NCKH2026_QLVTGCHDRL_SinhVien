/**
 * useAuth Hook
 * Business Layer - Authentication operations hook
 */

import { useState, useCallback } from 'react';
import { authApi, LoginDto, RegisterDto, LoginResponse } from '../api/repositories';
import type { AuthUser } from '../types';

export interface UseAuthReturn {
    // State
    user: AuthUser | null;
    loading: boolean;
    error: Error | null;

    // Actions
    login: (data: LoginDto) => Promise<LoginResponse>;
    logout: () => Promise<void>;
    register: (data: RegisterDto) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    getMe: () => Promise<AuthUser>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const login = useCallback(async (data: LoginDto): Promise<LoginResponse> => {
        setLoading(true);
        setError(null);
        try {
            const response = await authApi.login(data);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await authApi.logout();
            setUser(null);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (data: RegisterDto) => {
        setLoading(true);
        setError(null);
        try {
            await authApi.register(data);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const forgotPassword = useCallback(async (email: string) => {
        setLoading(true);
        setError(null);
        try {
            await authApi.forgotPassword(email);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const resetPassword = useCallback(async (token: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            await authApi.resetPassword(token, password);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getMe = useCallback(async (): Promise<AuthUser> => {
        setLoading(true);
        setError(null);
        try {
            const response = await authApi.getMe();
            setUser(response);
            return response;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
        setLoading(true);
        setError(null);
        try {
            await authApi.changePassword(oldPassword, newPassword);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        user,
        loading,
        error,
        login,
        logout,
        register,
        forgotPassword,
        resetPassword,
        getMe,
        changePassword,
    };
}

export default useAuth;
