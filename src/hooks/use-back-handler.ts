'use client';

import { useEffect, useRef } from 'react';
import { pushBackHandler, removeBackHandler } from '@/lib/back-handler-stack';

/**
 * Intercept the hardware/gesture back button while this component is
 * mounted and `active` is true — e.g. to cancel an edit instead of
 * navigating away. Falls through to normal navigation when inactive.
 */
export function useBackHandler(handler: () => void, active: boolean = true): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!active) return;

    const stableHandler = () => handlerRef.current();
    pushBackHandler(stableHandler);
    return () => removeBackHandler(stableHandler);
  }, [active]);
}
