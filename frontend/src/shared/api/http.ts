/**
 * HTTP Client - Axios Wrapper
 * Data Layer - Infrastructure
 * TypeScript version with proper typing
 */

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import sessionStorageManager from './sessionStorageManager';
import { computeBaseURL } from './baseUrl';

// Extend window interface for debug helpers
declare global {
    interface Window {
        setApiBase: (url: string) => void;
        resetApiBase: () => void;
        getApiBase: () => void;
    }
}

const initialBaseURL = computeBaseURL();

const http: AxiosInstance = axios.create({
    baseURL: initialBaseURL,
    withCredentials: false, // false for Docker; cookies not used currently
    timeout: 8000, // prevent UI hanging on dead endpoints
});

// Log once so we can see where the frontend is calling
try {
    console.log('[HTTP] BaseURL =', http.defaults.baseURL);
} catch (_) { /* ignore */ }

// Expose helpers to manage baseURL at runtime from browser console
try {
    window.setApiBase = function setApiBase(url: string): void {
        if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
            console.warn('Usage: setApiBase("http://IP:3001/api")');
            return;
        }
        const clean = url.replace(/\/$/, '');
        try { window.localStorage.setItem('API_BASE_URL', clean); } catch (_) { /* ignore */ }
        http.defaults.baseURL = clean;
        console.log('[HTTP] BaseURL overridden ->', clean);
    };

    window.resetApiBase = function resetApiBase(): void {
        try {
            window.localStorage.removeItem('API_BASE_URL');
            console.log('[HTTP] API_BASE_URL cleared from localStorage');
        } catch (_) { /* ignore */ }
        window.location.reload();
    };

    window.getApiBase = function getApiBase(): void {
        console.log('[HTTP] Current BaseURL:', http.defaults.baseURL);
        console.log('[HTTP] Stored BaseURL:', window.localStorage.getItem('API_BASE_URL'));
    };
} catch (_) { /* ignore */ }

// Helper functions for URL rewriting
function rewrite(config: InternalAxiosRequestConfig, from: string, to: string): void {
    if (config.url === from) {
        config.url = to;
    } else if (config.url?.startsWith(from + '?')) {
        config.url = to + config.url.slice(from.length);
    }
}

function rewriteStarts(config: InternalAxiosRequestConfig, fromPrefix: string, toPrefix: string): void {
    if (config.url?.startsWith(fromPrefix)) {
        config.url = toPrefix + config.url.slice(fromPrefix.length);
    }
}

// Attach Authorization header, TabId, and normalize URLs
http.interceptors.request.use(
    function attachAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        try {
            const base = String(http.defaults.baseURL || '').replace(/\/+$/, '');

            // Normalize /api prefix
            if (typeof config.url === 'string' && base.endsWith('/api')) {
                if (config.url === '/api') {
                    config.url = '/';
                } else if (config.url.startsWith('/api/')) {
                    config.url = config.url.slice(4);
                }
            }

            // ================== LEGACY ADMIN ENDPOINT MIGRATION ==================
            if (typeof config.url === 'string' && config.url.startsWith('/admin')) {
                const originalUrl = config.url;

                // Dashboard
                rewrite(config, '/admin/dashboard', '/core/dashboard/admin');

                // Users
                rewriteStarts(config, '/admin/users/', '/core/admin/users/');
                rewrite(config, '/admin/users', '/core/admin/users');

                // User points
                config.url = config.url.replace(
                    /^\/admin\/users\/(\d+|[^/]+)\/points(\?|$)/,
                    (_m: string, id: string, tail: string) => `/core/admin/reports/users/${id}/points${tail || ''}`
                );

                // Roles
                rewriteStarts(config, '/admin/roles/', '/core/roles/');
                rewrite(config, '/admin/roles', '/core/roles');

                // Classes
                rewrite(config, '/admin/classes', '/core/admin/reports/classes');

                // Attendance
                rewrite(config, '/admin/attendance', '/core/admin/reports/attendance');
                rewriteStarts(config, '/admin/reports/attendance', '/core/admin/reports/attendance');

                // Activities
                config.url = config.url.replace(
                    /^\/admin\/activities\/(\d+|[^/]+)\/(approve|reject)(\?|$)/,
                    (_m: string, id: string, action: string, tail: string) => `/core/activities/${id}/${action}${tail || ''}`
                );
                rewriteStarts(config, '/admin/activities/', '/core/activities/');
                rewrite(config, '/admin/activities', '/core/activities');

                // Activity types
                rewriteStarts(config, '/admin/activity-types/', '/core/activity-types/');
                rewrite(config, '/admin/activity-types', '/core/activity-types');

                // Broadcast
                rewrite(config, '/admin/notifications/broadcast/stats', '/core/broadcast/stats');
                rewrite(config, '/admin/notifications/broadcast/history', '/core/broadcast/history');
                if (config.method === 'post' && config.url === '/admin/notifications/broadcast') {
                    config.url = '/core/broadcast';
                }

                // Registrations
                rewriteStarts(config, '/admin/registrations/', '/core/admin/registrations/');
                rewrite(config, '/admin/registrations', '/core/admin/registrations');
                if (config.url === '/admin/registrations/bulk') {
                    config.url = '/core/admin/registrations/bulk';
                }

                // Reports
                rewriteStarts(config, '/admin/reports/export/', '/core/admin/reports/export/');
                rewrite(config, '/admin/reports/overview', '/core/admin/reports/overview');
                rewrite(config, '/admin/reports/classes', '/core/admin/reports/classes');
                rewrite(config, '/admin/reports/export/activities', '/core/admin/reports/export/activities');
                rewrite(config, '/admin/reports/export/registrations', '/core/admin/reports/export/registrations');

                if (originalUrl !== config.url && process.env.NODE_ENV === 'development') {
                    console.log('[HTTP] Rewrote legacy admin URL ->', originalUrl, '=>', config.url);
                }
            }

            // ================== LEGACY ACTIVITIES ENDPOINT MIGRATION ==================
            if (typeof config.url === 'string' && config.url.startsWith('/activities')) {
                const originalUrl = config.url;

                rewrite(config, '/activities', '/core/activities');
                rewriteStarts(config, '/activities/', '/core/activities/');

                if (originalUrl !== config.url && process.env.NODE_ENV === 'development') {
                    console.log('[HTTP] Rewrote legacy activities URL ->', originalUrl, '=>', config.url);
                }
            }

            // Teacher-specific legacy routes
            if (typeof config.url === 'string') {
                if (config.url.startsWith('/teacher/activity-types')) {
                    const originalUrl2 = config.url;
                    rewriteStarts(config, '/teacher/activity-types/', '/core/activity-types/');
                    if (config.url === '/teacher/activity-types') {
                        config.url = '/core/activity-types';
                    }
                    if (originalUrl2 !== config.url && process.env.NODE_ENV === 'development') {
                        console.log('[HTTP] Rewrote legacy teacher URL ->', originalUrl2, '=>', config.url);
                    }
                }

                // Teacher v1 -> v2 prefix fix
                if (config.url.startsWith('/teacher/')) {
                    const original = config.url;
                    config.url = '/core/teachers/' + config.url.slice('/teacher/'.length);
                    if (process.env.NODE_ENV === 'development') {
                        console.log('[HTTP] Normalized teacher URL ->', original, '=>', config.url);
                    }
                }
            }

            // Get token from tab-scoped session storage
            const token = sessionStorageManager.getToken();
            const tabId = sessionStorageManager.getTabId();

            if (process.env.NODE_ENV === 'development') {
                console.log('HTTP Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing', 'TabId:', tabId || 'Not set');
            }

            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + token;
            }

            if (tabId) {
                config.headers = config.headers || {};
                config.headers['X-Tab-Id'] = tabId;
            }
        } catch (_) { /* ignore */ }

        return config;
    },
    function onReqError(error: AxiosError): Promise<never> {
        return Promise.reject(error);
    }
);

http.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    (error: AxiosError): Promise<never> => {
        try {
            if (error?.code === 'ECONNABORTED') {
                error.message = 'Kết nối API quá thời gian (timeout). Vui lòng kiểm tra địa chỉ API và mạng.';
            } else if (error?.message && /Network\s?Error/i.test(error.message)) {
                error.message = 'Không thể kết nối API (Network Error). Vui lòng kiểm tra địa chỉ API và mạng.';
            }
        } catch (_) { /* ignore */ }
        return Promise.reject(error);
    }
);

export default http;
