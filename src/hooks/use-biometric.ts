import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '@/db/database';
import {
  checkBiometricStatus,
  authenticate,
  getBiometryTypeId,
  BIOMETRIC_ENROLLMENT_KEY,
  type BiometricStatus,
} from '@/lib/biometric';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BACKGROUND_TIMEOUT_MS = 30_000; // 30 seconds

export interface BiometricState {
  /** Whether the user has enabled biometric lock in settings */
  isEnabled: boolean;
  /** Hardware availability status */
  biometricStatus: BiometricStatus;
  /** Whether the app is currently locked */
  isLocked: boolean;
  /** Whether we're still loading the initial state */
  loading: boolean;
}

/**
 * Hook for managing biometric authentication state.
 *
 * Handles:
 * - Checking hardware availability
 * - Loading user preference from AppSettings
 * - Locking on app launch when enabled
 * - Re-locking after 30s in background
 * - Unlock via biometric prompt
 * - Enable/disable toggle with verification
 */
export function useBiometric() {
  const [state, setState] = useState<BiometricState>({
    isEnabled: false,
    biometricStatus: 'not_available',
    isLocked: false,
    loading: true,
  });

  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wentBackgroundAtRef = useRef<number | null>(null);

  // Load initial state + store enrollment snapshot
  useEffect(() => {
    async function load() {
      const [setting, status, enrollmentId] = await Promise.all([
        db.settings.get(BIOMETRIC_ENABLED_KEY),
        checkBiometricStatus(),
        getBiometryTypeId(),
      ]);

      const isEnabled = setting?.value === 'true';

      // Store current enrollment ID for change detection
      if (isEnabled && enrollmentId) {
        await db.settings.put({ key: BIOMETRIC_ENROLLMENT_KEY, value: enrollmentId });
      }

      setState({
        isEnabled,
        biometricStatus: status,
        isLocked: isEnabled && status === 'available', // Lock on launch if enabled
        loading: false,
      });
    }

    load();
  }, []);

  // Background/foreground lifecycle handling
  useEffect(() => {
    async function checkEnrollmentChange() {
      const [storedEnrollment, currentEnrollment] = await Promise.all([
        db.settings.get(BIOMETRIC_ENROLLMENT_KEY),
        getBiometryTypeId(),
      ]);

      if (
        storedEnrollment?.value &&
        currentEnrollment &&
        storedEnrollment.value !== currentEnrollment
      ) {
        // Enrollment changed — force re-authentication
        await db.settings.put({ key: BIOMETRIC_ENROLLMENT_KEY, value: currentEnrollment });
        setState((prev) => {
          if (prev.isEnabled && prev.biometricStatus === 'available') {
            return { ...prev, isLocked: true };
          }
          return prev;
        });
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        // App went to background
        wentBackgroundAtRef.current = Date.now();
      } else {
        // App came to foreground
        const wentAt = wentBackgroundAtRef.current;
        wentBackgroundAtRef.current = null;

        if (backgroundTimerRef.current) {
          clearTimeout(backgroundTimerRef.current);
          backgroundTimerRef.current = null;
        }

        if (wentAt && Date.now() - wentAt > BACKGROUND_TIMEOUT_MS) {
          // Was in background longer than 30s — re-lock if biometric is enabled
          setState((prev) => {
            if (prev.isEnabled && prev.biometricStatus === 'available') {
              return { ...prev, isLocked: true };
            }
            return prev;
          });
        }

        // Check for biometric enrollment change (e.g., new fingerprint added)
        void checkEnrollmentChange();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
      }
    };
  }, []);

  /**
   * Attempt to unlock via biometric prompt.
   * Returns true if successful.
   */
  const unlock = useCallback(async (): Promise<boolean> => {
    const success = await authenticate('Unlock HomeDocket');
    if (success) {
      setState((prev) => ({ ...prev, isLocked: false }));
    }
    return success;
  }, []);

  /**
   * Enable biometric lock. Verifies biometric is available first.
   */
  const enableBiometric = useCallback(async (): Promise<boolean> => {
    const status = await checkBiometricStatus();
    if (status !== 'available') {
      return false;
    }

    // Verify the user can authenticate before enabling
    const verified = await authenticate('Verify to enable biometric lock');
    if (!verified) {
      return false;
    }

    await db.settings.put({ key: BIOMETRIC_ENABLED_KEY, value: 'true' });
    setState((prev) => ({ ...prev, isEnabled: true, biometricStatus: status }));
    return true;
  }, []);

  /**
   * Disable biometric lock. Requires current biometric verification.
   */
  const disableBiometric = useCallback(async (): Promise<boolean> => {
    // Must verify identity to disable
    const verified = await authenticate('Verify to disable biometric lock');
    if (!verified) {
      return false;
    }

    await db.settings.put({ key: BIOMETRIC_ENABLED_KEY, value: 'false' });
    setState((prev) => ({ ...prev, isEnabled: false, isLocked: false }));
    return true;
  }, []);

  return {
    ...state,
    unlock,
    enableBiometric,
    disableBiometric,
  };
}
