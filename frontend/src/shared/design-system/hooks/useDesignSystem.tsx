/**
 * Design System — DesignProvider
 *
 * Cung cấp theme context và CSS variables cho toàn bộ ứng dụng.
 * Sử dụng: <DesignProvider theme="dark">...</DesignProvider>
 *
 * @module design-system
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

/* ============================================================
   Types
   ============================================================ */

export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

interface DesignContextValue {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

interface DesignProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  onThemeChange?: (theme: Theme, colorScheme: ColorScheme) => void;
}

/* ============================================================
   Context
   ============================================================ */

const DesignContext = createContext<DesignContextValue | undefined>(undefined);

function getSystemColorScheme(): ColorScheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveColorScheme(theme: Theme, system: ColorScheme): ColorScheme {
  if (theme === 'system') return system;
  return theme;
}

/* ============================================================
   Hook
   ============================================================ */

export function useDesignSystem(): DesignContextValue {
  const ctx = useContext(DesignContext);
  if (!ctx) {
    throw new Error('useDesignSystem must be used within <DesignProvider>');
  }
  return ctx;
}

/* ============================================================
   Provider
   ============================================================ */

export function DesignProvider({
  children,
  defaultTheme = 'light',
  onThemeChange,
}: DesignProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored || defaultTheme;
  });

  const [systemScheme, setSystemScheme] = useState<ColorScheme>(getSystemColorScheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const colorScheme = resolveColorScheme(theme, systemScheme);
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    onThemeChange?.(theme, colorScheme);
  }, [isDark, theme, colorScheme, onThemeChange]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);

  const toggleTheme = () => {
    if (colorScheme === 'dark') {
      setThemeState('light');
    } else {
      setThemeState('dark');
    }
  };

  return (
    <DesignContext.Provider value={{ theme, colorScheme, setTheme, toggleTheme, isDark }}>
      {children}
    </DesignContext.Provider>
  );
}

/* ============================================================
   useTheme Hook (standalone)
   ============================================================ */

export function useTheme() {
  const { theme, colorScheme, setTheme, toggleTheme, isDark } = useDesignSystem();
  return { theme, colorScheme, setTheme, toggleTheme, isDark };
}
