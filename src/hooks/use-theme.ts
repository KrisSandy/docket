'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/db/database';

export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_KEY = 'theme_mode';

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const isDark =
    mode === 'dark' || (mode === 'system' && getSystemPrefersDark());

  document.documentElement.classList.toggle('dark', isDark);

  // Update meta theme-color for native feel
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', isDark ? '#0d0d0f' : '#ffffff');
  }
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [loading, setLoading] = useState(true);

  // Load persisted preference on mount
  useEffect(() => {
    db.settings.get(THEME_KEY).then((setting) => {
      const saved = setting?.value as ThemeMode | undefined;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setMode(saved);
        applyTheme(saved);
      } else {
        applyTheme('system');
      }
      setLoading(false);
    });
  }, []);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mode]);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    applyTheme(newMode);
    db.settings.put({ key: THEME_KEY, value: newMode });
  }, []);

  const isDark =
    mode === 'dark' || (mode === 'system' && getSystemPrefersDark());

  return { mode, isDark, loading, setTheme };
}
