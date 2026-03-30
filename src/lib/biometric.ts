/**
 * Biometric authentication utilities.
 * Wraps Capacitor biometric plugin with graceful web fallbacks.
 *
 * Uses @aparajita/capacitor-biometric-auth for Capacitor 7+ support.
 * Falls back gracefully on web where biometric is not available.
 */

export type BiometricStatus = 'available' | 'not_available' | 'not_enrolled';

/**
 * Key used to store a hash of the biometric enrollment state.
 * When the enrollment set changes (e.g., new fingerprint added),
 * we detect it on next foreground and force re-authentication.
 */
export const BIOMETRIC_ENROLLMENT_KEY = 'biometric_enrollment_hash';

/**
 * Internal helper: load the biometric plugin if available.
 * Returns null on web or if the plugin is not installed.
 */
async function loadPlugin(): Promise<{
  checkBiometry: () => Promise<{ isAvailable: boolean; biometryType: number }>;
  authenticate: (options: { reason: string; allowDeviceCredential: boolean }) => Promise<void>;
} | null> {
  try {
    // Dynamic import — resolves only when native plugin is available
    const mod = await import('@aparajita/capacitor-biometric-auth');
    return mod.BiometricAuth ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if biometric authentication is available on the device.
 */
export async function checkBiometricStatus(): Promise<BiometricStatus> {
  const plugin = await loadPlugin();
  if (!plugin) return 'not_available';

  try {
    const result = await plugin.checkBiometry();

    if (result.isAvailable) {
      return 'available';
    }

    // Hardware exists but nothing enrolled
    if (result.biometryType !== 0) {
      return 'not_enrolled';
    }

    return 'not_available';
  } catch {
    return 'not_available';
  }
}

/**
 * Get the current biometry type as a string identifier.
 * Used to detect enrollment changes (e.g., new fingerprint added).
 * Returns a stable string for the current enrollment state, or null if unavailable.
 */
export async function getBiometryTypeId(): Promise<string | null> {
  const plugin = await loadPlugin();
  if (!plugin) return null;

  try {
    const result = await plugin.checkBiometry();
    // biometryType is an enum: 0=none, 1=touchId, 2=faceId, 3=fingerprintAuthentication, etc.
    // We use it combined with isAvailable as a proxy for enrollment state.
    // On platforms that expose more detail, we'd hash the enrolled credential IDs.
    return `${result.biometryType}-${result.isAvailable ? '1' : '0'}`;
  } catch {
    return null;
  }
}

/**
 * Prompt the user for biometric authentication.
 * Returns true if authentication succeeded, false otherwise.
 */
export async function authenticate(reason?: string): Promise<boolean> {
  const plugin = await loadPlugin();
  if (!plugin) return false;

  try {
    await plugin.authenticate({
      reason: reason ?? 'Unlock HomeDocket',
      allowDeviceCredential: true,
    });
    return true;
  } catch {
    return false;
  }
}
