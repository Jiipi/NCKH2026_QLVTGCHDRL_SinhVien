/**
 * Enhanced Tab Session Manager với SessionStorage + Unique Tab ID
 * OWASP Recommended Approach for Multi-Tab Session Management
 * TypeScript Version
 */

import { computeBaseURL } from './baseUrl';

// ============ TYPES ============
export interface SessionData {
    tabId: string;
    token: string;
    user: UserData | null;
    role: string;
    timestamp: number;
    lastActivity: number;
}

export interface UserData {
    id: string;
    email: string;
    ho_ten: string;
    ma_so?: string;
    avatar?: string;
    vai_tro?: {
        id: string;
        ten_vt: string;
    };
    lop?: {
        id: string;
        ten_lop: string;
    };
}

export interface TabInfo {
    createdAt: number;
    lastActivity: number;
    isActive: boolean;
    userAgent: string;
    url: string;
    hasSession?: boolean;
    role?: string | null;
    userId?: string | null;
    userName?: string | null;
}

export interface TabRegistry {
    [tabId: string]: TabInfo;
}

export interface ActiveTab extends TabInfo {
    tabId: string;
    isCurrent: boolean;
    timeSinceActivity: number;
}

export interface CurrentTabInfo {
    tabId: string;
    isAuthenticated: boolean;
    session: SessionData | null;
    hasSession: boolean;
    role: string | null;
    user: UserData | null;
    token: string | null;
}

// ============ CLASS ============
class SessionStorageManager {
    private tabId: string;
    private readonly SESSION_KEY_PREFIX = 'tab_session_data';
    private SESSION_KEY: string;
    private readonly TAB_REGISTRY_KEY = 'all_tabs_registry';
    private readonly SYNC_EVENT_KEY = 'tab_sync_event';
    private apiBaseUrl: string | null = null;
    private isAuthenticated = false;
    private sessionData: SessionData | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Attempt to reuse existing tabId if present
        let existingTabId: string | null = null;
        try {
            existingTabId = sessionStorage.getItem('tab_id') || localStorage.getItem('tab_id_temp');
        } catch (_) { /* ignore */ }

        if (existingTabId) {
            this.tabId = existingTabId;
        } else {
            this.tabId = this.generateTabId();
            try { sessionStorage.setItem('tab_id', this.tabId); } catch (_) { /* ignore */ }
            try { localStorage.setItem('tab_id_temp', this.tabId); } catch (_) { /* ignore */ }
        }

        this.SESSION_KEY = `${this.SESSION_KEY_PREFIX}_${this.tabId}`;
        this.init();
    }

    private generateTabId(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const counter = performance.now().toString(36).substring(2);
        return `tab_${timestamp}_${random}_${counter}`;
    }

    private init(): void {
        console.log('[SessionStorage] Initializing with Tab ID:', this.tabId);
        this.migrateLegacySessionIfNeeded();
        this.registerTab();
        this.loadSession();
        this.setupEventListeners();
        this.startHeartbeat();

        if (!this.tabId) {
            console.warn('[SessionStorage] TabId not properly initialized, regenerating...');
            this.tabId = this.generateTabId();
            try {
                sessionStorage.setItem('tab_id', this.tabId);
                localStorage.setItem('tab_id_temp', this.tabId);
            } catch (_) { /* ignore */ }
        }
    }

    private registerTab(): void {
        try {
            const registry = this.getTabRegistry();
            registry[this.tabId] = {
                createdAt: Date.now(),
                lastActivity: Date.now(),
                isActive: true,
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            localStorage.setItem(this.TAB_REGISTRY_KEY, JSON.stringify(registry));
            console.log('[SessionStorage] Tab registered:', this.tabId);
        } catch (error) {
            console.error('[SessionStorage] Error registering tab:', error);
        }
    }

    private getTabRegistry(): TabRegistry {
        try {
            const data = localStorage.getItem(this.TAB_REGISTRY_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('[SessionStorage] Error getting tab registry:', error);
            return {};
        }
    }

    private loadSession(): void {
        try {
            const data = sessionStorage.getItem(this.SESSION_KEY);
            if (data) {
                this.sessionData = JSON.parse(data);
                this.isAuthenticated = !!(this.sessionData?.token);
                console.log('[SessionStorage] Session loaded:', {
                    tabId: this.tabId,
                    isAuthenticated: this.isAuthenticated,
                    role: this.sessionData?.role,
                    user: this.sessionData?.user?.ho_ten
                });
            } else {
                console.log('[SessionStorage] No session found for tab:', this.tabId);
            }
        } catch (error) {
            console.error('[SessionStorage] Error loading session:', error);
            this.sessionData = null;
            this.isAuthenticated = false;
        }
    }

    public saveSession(data: { token: string; user: UserData | null; role: string }): boolean {
        try {
            const sessionData: SessionData = {
                tabId: this.tabId,
                token: data.token,
                user: data.user,
                role: data.role,
                timestamp: Date.now(),
                lastActivity: Date.now()
            };

            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            this.sessionData = sessionData;
            this.isAuthenticated = true;

            this.updateTabActivity({
                hasSession: true,
                role: data.role,
                userId: data.user?.id,
                userName: data.user?.ho_ten
            });

            console.log('[SessionStorage] Session saved:', {
                tabId: this.tabId,
                role: data.role,
                user: data.user?.ho_ten
            });

            this.sendSessionPing('heartbeat');
            this.emitSyncEvent('session_saved', { ...sessionData });

            return true;
        } catch (error) {
            console.error('[SessionStorage] Error saving session:', error);
            return false;
        }
    }

    public getSession(): SessionData | null {
        if (!this.sessionData) {
            this.loadSession();
        }
        return this.sessionData;
    }

    public hasSession(): boolean {
        return this.isAuthenticated && !!this.sessionData?.token;
    }

    public getToken(): string | null {
        const session = this.getSession();
        return session?.token || null;
    }

    public getUser(): UserData | null {
        const session = this.getSession();
        return session?.user || null;
    }

    public getRole(): string | null {
        const session = this.getSession();
        return session?.role || null;
    }

    public getTabId(): string {
        return this.tabId;
    }

    public clearSession(): boolean {
        try {
            sessionStorage.removeItem(this.SESSION_KEY);

            if (this.sessionData?.token) {
                this.sendSessionPing('logout');
            }

            this.sessionData = null;
            this.isAuthenticated = false;

            this.updateTabActivity({ hasSession: false, role: null, userId: null, userName: null });

            console.log('[SessionStorage] Session cleared for tab:', this.tabId, '(other tabs not affected)');

            this.emitSyncEvent('session_cleared', { tabId: this.tabId });

            return true;
        } catch (error) {
            console.error('[SessionStorage] Error clearing session:', error);
            return false;
        }
    }

    public clearAllSessions(): boolean {
        try {
            const allKeys = Object.keys(sessionStorage);
            const sessionKeys = allKeys.filter(key => key.startsWith(this.SESSION_KEY_PREFIX + '_'));

            sessionKeys.forEach(key => {
                sessionStorage.removeItem(key);
            });

            if (this.sessionData?.token) {
                this.sendSessionPing('logout');
            }

            this.sessionData = null;
            this.isAuthenticated = false;

            this.emitSyncEvent('logout_all', { initiatorTabId: this.tabId });

            localStorage.removeItem('token');
            localStorage.removeItem('user');

            console.log('[SessionStorage] All sessions cleared:', sessionKeys.length, 'tabs');
            return true;
        } catch (error) {
            console.error('[SessionStorage] Error clearing all sessions:', error);
            return false;
        }
    }

    private updateTabActivity(additionalData: Partial<TabInfo> = {}): void {
        try {
            const registry = this.getTabRegistry();
            if (registry[this.tabId]) {
                registry[this.tabId] = {
                    ...registry[this.tabId],
                    lastActivity: Date.now(),
                    isActive: !document.hidden,
                    url: window.location.href,
                    ...additionalData
                };
                localStorage.setItem(this.TAB_REGISTRY_KEY, JSON.stringify(registry));
            }
        } catch (error) {
            console.error('[SessionStorage] Error updating tab activity:', error);
        }
    }

    private setupEventListeners(): void {
        window.addEventListener('storage', this.handleStorageEvent.bind(this));
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        window.addEventListener('focus', this.handleFocus.bind(this));
    }

    private handleStorageEvent(event: StorageEvent): void {
        if (event.key === this.SYNC_EVENT_KEY) {
            try {
                if (!event.newValue) return;
                const data = JSON.parse(event.newValue);
                if (!data || typeof data !== 'object') return;

                if (data.tabId === this.tabId) return;

                console.log('[SessionStorage] Storage event received:', data.type);

                switch (data.type) {
                    case 'logout_all':
                        this.clearSession();
                        window.dispatchEvent(new CustomEvent('tab_logout_all', { detail: data }));
                        break;

                    case 'session_saved':
                    case 'session_cleared':
                        window.dispatchEvent(new CustomEvent('tab_session_sync', { detail: data }));
                        break;

                    default:
                        console.log('[SessionStorage] Unknown sync event type:', data.type);
                }
            } catch (error) {
                console.error('[SessionStorage] Error handling storage event:', error);
            }
        }
    }

    private handleBeforeUnload(): void {
        try {
            if (this.sessionData?.token) {
                this.sendSessionPing('logout');
            }
            const registry = this.getTabRegistry();
            delete registry[this.tabId];
            localStorage.setItem(this.TAB_REGISTRY_KEY, JSON.stringify(registry));

            console.log('[SessionStorage] Tab unregistered:', this.tabId);
        } catch (error) {
            console.error('[SessionStorage] Error in beforeunload:', error);
        }
    }

    private handleVisibilityChange(): void {
        this.updateTabActivity({ isActive: !document.hidden });
    }

    private handleFocus(): void {
        this.updateTabActivity({ isActive: true });
    }

    private emitSyncEvent(type: string, data: Record<string, unknown>): void {
        try {
            const event = {
                type,
                tabId: this.tabId,
                timestamp: Date.now(),
                ...data
            };

            if (type === 'session_saved' || type === 'session_cleared') {
                window.dispatchEvent(new CustomEvent('tab_session_sync', { detail: event }));
            } else if (type === 'logout_all') {
                window.dispatchEvent(new CustomEvent('tab_logout_all', { detail: event }));
            }

            localStorage.setItem(this.SYNC_EVENT_KEY, JSON.stringify(event));

            setTimeout(() => {
                try {
                    localStorage.removeItem(this.SYNC_EVENT_KEY);
                } catch (e) { /* ignore */ }
            }, 100);
        } catch (error) {
            console.error('[SessionStorage] Error emitting sync event:', error);
        }
    }

    private startHeartbeat(): void {
        this.stopHeartbeat();
        const beat = (): void => {
            if (!document.hidden) {
                this.updateTabActivity();
            }
            if (this.hasSession()) {
                this.sendSessionPing('heartbeat');
            }
        };
        beat();
        this.heartbeatInterval = setInterval(beat, 30000);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    public getActiveTabs(): ActiveTab[] {
        try {
            const registry = this.getTabRegistry();
            const now = Date.now();
            const tabs: ActiveTab[] = [];

            Object.entries(registry).forEach(([tabId, data]) => {
                const timeSinceActivity = now - data.lastActivity;
                if (timeSinceActivity < 5 * 60 * 1000) {
                    tabs.push({
                        tabId,
                        ...data,
                        isCurrent: tabId === this.tabId,
                        timeSinceActivity
                    });
                }
            });

            tabs.sort((a, b) => b.lastActivity - a.lastActivity);

            return tabs;
        } catch (error) {
            console.error('[SessionStorage] Error getting active tabs:', error);
            return [];
        }
    }

    public cleanupExpiredTabs(): void {
        try {
            const registry = this.getTabRegistry();
            const now = Date.now();
            const expirationTime = 24 * 60 * 60 * 1000;

            let cleaned = false;
            Object.keys(registry).forEach(tabId => {
                const tab = registry[tabId];
                if (now - tab.lastActivity > expirationTime) {
                    delete registry[tabId];
                    cleaned = true;
                }
            });

            if (cleaned) {
                localStorage.setItem(this.TAB_REGISTRY_KEY, JSON.stringify(registry));
                console.log('[SessionStorage] Expired tabs cleaned');
            }
        } catch (error) {
            console.error('[SessionStorage] Error cleaning expired tabs:', error);
        }
    }

    public getCurrentTabInfo(): CurrentTabInfo {
        return {
            tabId: this.tabId,
            isAuthenticated: this.isAuthenticated,
            session: this.sessionData,
            hasSession: this.hasSession(),
            role: this.getRole(),
            user: this.getUser(),
            token: this.getToken()
        };
    }

    public destroy(): void {
        this.stopHeartbeat();
        this.handleBeforeUnload();
    }

    private migrateLegacySessionIfNeeded(): void {
        try {
            const legacyKey = 'tab_session_data';
            const legacy = sessionStorage.getItem(legacyKey);
            if (legacy && !sessionStorage.getItem(this.SESSION_KEY)) {
                console.log('[SessionStorage] Migrating legacy key ->', this.SESSION_KEY);
                sessionStorage.setItem(this.SESSION_KEY, legacy);
                sessionStorage.removeItem(legacyKey);
            }
        } catch (e) {
            console.warn('[SessionStorage] migrateLegacySessionIfNeeded failed', e);
        }
    }

    private getApiBaseUrl(): string {
        if (this.apiBaseUrl) return this.apiBaseUrl;
        if (typeof window === 'undefined') {
            this.apiBaseUrl = 'http://localhost:3001/api';
            return this.apiBaseUrl;
        }
        try {
            const stored = window.localStorage.getItem('API_BASE_URL');
            if (stored && /^https?:\/\//i.test(stored)) {
                this.apiBaseUrl = stored.replace(/\/$/, '');
                return this.apiBaseUrl;
            }
        } catch (_) { /* ignore */ }
        const computed = computeBaseURL?.();
        this.apiBaseUrl = (computed || 'http://localhost:3001/api').replace(/\/$/, '');
        return this.apiBaseUrl;
    }

    public async sendSessionPing(type: 'heartbeat' | 'logout' = 'heartbeat'): Promise<boolean> {
        try {
            if (!this.hasSession()) return false;
            const baseUrl = this.getApiBaseUrl();
            if (!baseUrl) return false;

            const endpoint = type === 'logout' ? '/core/sessions/logout' : '/core/sessions/heartbeat';
            const legacyEndpoint = type === 'logout' ? '/sessions/logout' : '/sessions/heartbeat';
            const method = type === 'logout' ? 'DELETE' : 'POST';

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-Tab-Id': this.tabId,
            };

            if (this.sessionData?.token) {
                headers.Authorization = `Bearer ${this.sessionData.token}`;
            }

            const options: RequestInit = {
                method,
                headers,
                keepalive: true,
            };

            const send = async (path: string): Promise<Response> => fetch(`${baseUrl}${path}`, options);
            let response = await send(endpoint);
            if (!response.ok && response.status === 404) {
                response = await send(legacyEndpoint);
            }
            return response.ok;
        } catch (error) {
            console.warn('[SessionStorage] Session ping failed:', type, error);
            return false;
        }
    }
}

// Singleton instance
const sessionStorageManager = new SessionStorageManager();

export default sessionStorageManager;
export { SessionStorageManager };
