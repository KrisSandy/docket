import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions for the plugin
const mockCheckBiometry = vi.fn();
const mockAuthenticate = vi.fn();

// Mock the dynamic import at the Capacitor module level
vi.mock('@aparajita/capacitor-biometric-auth', () => ({
  BiometricAuth: {
    checkBiometry: mockCheckBiometry,
    authenticate: mockAuthenticate,
  },
}));

import { checkBiometricStatus, authenticate, getBiometryTypeId, BIOMETRIC_ENROLLMENT_KEY } from '@/lib/biometric';

describe('biometric utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkBiometricStatus', () => {
    it('returns "available" when biometric is available', async () => {
      mockCheckBiometry.mockResolvedValue({
        isAvailable: true,
        biometryType: 1,
      });

      const result = await checkBiometricStatus();
      expect(result).toBe('available');
    });

    it('returns "not_enrolled" when hardware exists but nothing enrolled', async () => {
      mockCheckBiometry.mockResolvedValue({
        isAvailable: false,
        biometryType: 1,
      });

      const result = await checkBiometricStatus();
      expect(result).toBe('not_enrolled');
    });

    it('returns "not_available" when no biometric hardware', async () => {
      mockCheckBiometry.mockResolvedValue({
        isAvailable: false,
        biometryType: 0,
      });

      const result = await checkBiometricStatus();
      expect(result).toBe('not_available');
    });

    it('returns "not_available" when plugin throws', async () => {
      mockCheckBiometry.mockRejectedValue(new Error('Not available'));

      const result = await checkBiometricStatus();
      expect(result).toBe('not_available');
    });
  });

  describe('authenticate', () => {
    it('returns true on successful authentication', async () => {
      mockAuthenticate.mockResolvedValue(undefined);

      const result = await authenticate();
      expect(result).toBe(true);
    });

    it('returns false on failed authentication', async () => {
      mockAuthenticate.mockRejectedValue(new Error('Auth failed'));

      const result = await authenticate();
      expect(result).toBe(false);
    });

    it('passes custom reason to biometric prompt', async () => {
      mockAuthenticate.mockResolvedValue(undefined);

      await authenticate('Custom reason');
      expect(mockAuthenticate).toHaveBeenCalledWith({
        reason: 'Custom reason',
        allowDeviceCredential: true,
      });
    });

    it('uses default reason when none provided', async () => {
      mockAuthenticate.mockResolvedValue(undefined);

      await authenticate();
      expect(mockAuthenticate).toHaveBeenCalledWith({
        reason: 'Unlock HomeDocket',
        allowDeviceCredential: true,
      });
    });
  });

  describe('getBiometryTypeId', () => {
    it('returns a string encoding biometry type and availability', async () => {
      mockCheckBiometry.mockResolvedValue({
        isAvailable: true,
        biometryType: 1,
      });

      const result = await getBiometryTypeId();
      expect(result).toBe('1-1');
    });

    it('returns different string when availability changes', async () => {
      mockCheckBiometry.mockResolvedValue({
        isAvailable: false,
        biometryType: 1,
      });

      const result = await getBiometryTypeId();
      expect(result).toBe('1-0');
    });

    it('returns null when plugin throws', async () => {
      mockCheckBiometry.mockRejectedValue(new Error('Not available'));

      const result = await getBiometryTypeId();
      expect(result).toBeNull();
    });
  });

  describe('BIOMETRIC_ENROLLMENT_KEY', () => {
    it('is a non-empty string', () => {
      expect(BIOMETRIC_ENROLLMENT_KEY).toBeTruthy();
      expect(typeof BIOMETRIC_ENROLLMENT_KEY).toBe('string');
    });
  });
});
