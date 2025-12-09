/**
 * Base URL Computation
 * Data Layer - Infrastructure
 */

const getQueryParam = (name: string): string | null => {
    try {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    } catch (_) {
        return null;
    }
};

export function computeBaseURL(): string {
    if (typeof window !== 'undefined' && window.location) {
        const { hostname, protocol } = window.location;

        // Force localhost during local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            try {
                const saved = window.localStorage.getItem('API_BASE_URL');
                if (saved && !saved.includes('localhost') && !saved.includes('127.0.0.1')) {
                    window.localStorage.removeItem('API_BASE_URL');
                }
            } catch (_) { /* ignore */ }
            return 'http://localhost:3001/api';
        }

        const apiFromQuery = getQueryParam('api');
        if (apiFromQuery && /^(auto|reset)$/i.test(apiFromQuery)) {
            try { window.localStorage.removeItem('API_BASE_URL'); } catch (_) { /* ignore */ }
        } else if (apiFromQuery && /^https?:\/\//i.test(apiFromQuery)) {
            try {
                window.localStorage.setItem('API_BASE_URL', apiFromQuery.replace(/\/$/, ''));
            } catch (_) { /* ignore */ }
            return apiFromQuery.replace(/\/$/, '');
        }

        try {
            const saved = window.localStorage.getItem('API_BASE_URL');
            if (saved && /^https?:\/\//i.test(saved)) {
                return saved.replace(/\/$/, '');
            }
        } catch (_) { /* ignore */ }

        if (process.env.REACT_APP_API_URL) {
            return String(process.env.REACT_APP_API_URL).replace(/\/$/, '');
        }

        if (process.env.NODE_ENV === 'development') {
            return 'http://localhost:3001/api';
        }

        return `${protocol}//${hostname}:3001/api`;
    }

    if (process.env.REACT_APP_API_URL) {
        return String(process.env.REACT_APP_API_URL).replace(/\/$/, '');
    }

    return 'http://dacn_backend_dev:3001/api';
}

export default computeBaseURL;
