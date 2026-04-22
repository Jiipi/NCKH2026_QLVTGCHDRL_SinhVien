/**
 * HTTP Client - Axios Wrapper
 * Data Layer - Infrastructure
 * TypeScript version with proper typing
 */

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosError, AxiosResponse, AxiosRequestHeaders } from 'axios';
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
            console.warn('Usage: setApiBase("http://IP:3001/api/v1")');
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

// Attach Authorization header, TabId, and normalize URLs
http.interceptors.request.use(
    function attachAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        try {
            const base = String(http.defaults.baseURL || '').replace(/\/+$/, '');

            // Normalize /api or /api/v1 prefix
            if (typeof config.url === 'string' && base.endsWith('/api')) {
                if (config.url === '/api') {
                    config.url = '/';
                } else if (config.url.startsWith('/api/')) {
                    config.url = config.url.slice(4);
                }
            } else if (typeof config.url === 'string' && base.endsWith('/api/v1')) {
                if (config.url === '/api/v1') {
                    config.url = '/';
                } else if (config.url.startsWith('/api/v1/')) {
                    config.url = config.url.slice('/api/v1'.length);
                } else if (config.url === '/api') {
                    config.url = '/';
                } else if (config.url.startsWith('/api/')) {
                    config.url = config.url.slice('/api'.length);
                }
            }

            // Get token from tab-scoped session storage
            const token = sessionStorageManager.getToken();
            const tabId = sessionStorageManager.getTabId();

            if (process.env.NODE_ENV === 'development') {
                console.log('HTTP Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing', 'TabId:', tabId || 'Not set');
            }

            if (token) {
                config.headers = (config.headers || {}) as AxiosRequestHeaders;
                config.headers.Authorization = 'Bearer ' + token;
            }

            if (tabId) {
                config.headers = (config.headers || {}) as AxiosRequestHeaders;
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
