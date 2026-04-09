'use client';

import { useEffect } from 'react';

/**
 * Fixed shield behind the device status bar.
 * 1. Configures Capacitor StatusBar plugin (no overlay, dark icons, matching bg).
 * 2. Renders a fixed element that covers the safe-area-inset-top zone so
 *    scrolling content disappears behind it instead of showing through.
 */
export function StatusBarShield() {
  useEffect(() => {
    const configure = async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0D0D0F' });
      } catch {
        // Not running in native Capacitor — ignore
      }
    };
    configure();
  }, []);

  return (
    <div
      className="safe-top fixed inset-x-0 top-0 z-[100] bg-background"
      aria-hidden="true"
    />
  );
}
