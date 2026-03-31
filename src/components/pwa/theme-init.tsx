'use client';

import { useTheme } from '@/hooks/use-theme';

/**
 * Invisible client component that initialises the theme on mount.
 * Placed in the root layout so the dark class is applied as early as possible.
 */
export function ThemeInit() {
  // The hook reads the persisted preference from IndexedDB and
  // toggles .dark on <html> + updates the theme-color meta tag.
  useTheme();
  return null;
}
