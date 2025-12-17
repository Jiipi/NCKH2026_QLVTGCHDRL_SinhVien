import { create } from 'zustand';

interface User {
  id?: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthPayload {
  token?: string;
  user?: User;
  role?: string;
}

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  token: string | null;
  user: User | null;
  role: string | null;
  setAuth: (payload: AuthPayload) => void;
  clearAuth: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  token: null,
  user: null,
  role: null,
  setAuth: (payload) => set(() => ({
    token: payload?.token || null,
    user: payload?.user || null,
    role: (payload?.user?.role || payload?.role || '').toString().toUpperCase() || null,
  })),
  clearAuth: () => set(() => ({ token: null, user: null, role: null })),
}));


