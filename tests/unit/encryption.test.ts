import { describe, it, expect } from 'vitest';
import {
  encryptData,
  decryptData,
  isValidEncryptedPayload,
  validateEncryptedPayload,
} from '@/lib/encryption';

describe('encryption', () => {
  const passphrase = 'test-passphrase-secure-123';
  const plaintext = '{"test": "data", "items": [1, 2, 3]}';

  describe('encryptData', () => {
    it('produces a JSON string with salt, iv, and ciphertext', async () => {
      const result = await encryptData(plaintext, passphrase);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('salt');
      expect(parsed).toHaveProperty('iv');
      expect(parsed).toHaveProperty('ciphertext');
      expect(typeof parsed.salt).toBe('string');
      expect(typeof parsed.iv).toBe('string');
      expect(typeof parsed.ciphertext).toBe('string');
    });

    it('produces non-readable output (ciphertext differs from plaintext)', async () => {
      const result = await encryptData(plaintext, passphrase);
      expect(result).not.toContain(plaintext);
    });

    it('produces different output each time (random salt/iv)', async () => {
      const result1 = await encryptData(plaintext, passphrase);
      const result2 = await encryptData(plaintext, passphrase);
      expect(result1).not.toBe(result2);
    });

    it('throws when passphrase is empty', async () => {
      await expect(encryptData(plaintext, '')).rejects.toThrow('Passphrase is required');
    });

    it('handles empty plaintext', async () => {
      const result = await encryptData('', passphrase);
      const decrypted = await decryptData(result, passphrase);
      expect(decrypted).toBe('');
    });

    it('handles large data', async () => {
      const largeData = 'x'.repeat(100_000);
      const result = await encryptData(largeData, passphrase);
      const decrypted = await decryptData(result, passphrase);
      expect(decrypted).toBe(largeData);
    });

    it('handles unicode content', async () => {
      const unicode = 'Héllo Wörld! 日本語テスト €500.00';
      const result = await encryptData(unicode, passphrase);
      const decrypted = await decryptData(result, passphrase);
      expect(decrypted).toBe(unicode);
    });
  });

  describe('decryptData', () => {
    it('correctly reverses encryption', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      const decrypted = await decryptData(encrypted, passphrase);
      expect(decrypted).toBe(plaintext);
    });

    it('throws on wrong passphrase', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      await expect(decryptData(encrypted, 'wrong-passphrase')).rejects.toThrow(
        'Decryption failed'
      );
    });

    it('throws on invalid JSON input', async () => {
      await expect(decryptData('not json', passphrase)).rejects.toThrow(
        'Invalid backup file format'
      );
    });

    it('throws on missing fields', async () => {
      await expect(decryptData('{"salt": "abc"}', passphrase)).rejects.toThrow(
        'missing required fields'
      );
    });

    it('throws when passphrase is empty', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      await expect(decryptData(encrypted, '')).rejects.toThrow('Passphrase is required');
    });

    it('throws on corrupted ciphertext', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      const parsed = JSON.parse(encrypted);
      // Corrupt the ciphertext
      parsed.ciphertext = parsed.ciphertext.slice(0, -4) + 'XXXX';
      await expect(decryptData(JSON.stringify(parsed), passphrase)).rejects.toThrow(
        'Decryption failed'
      );
    });
  });

  describe('isValidEncryptedPayload', () => {
    it('returns true for valid encrypted payload', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      expect(isValidEncryptedPayload(encrypted)).toBe(true);
    });

    it('returns false for plain JSON', () => {
      expect(isValidEncryptedPayload('{"test": "data"}')).toBe(false);
    });

    it('returns false for non-JSON string', () => {
      expect(isValidEncryptedPayload('not json')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidEncryptedPayload('')).toBe(false);
    });

    it('returns false for partial payload', () => {
      expect(isValidEncryptedPayload('{"salt": "abc", "iv": "def"}')).toBe(false);
    });

    // Regression: files transferred phone→laptop (AirDrop, email, cloud
    // sync, Android Downloads provider) can pick up a UTF-8 BOM or
    // surrounding whitespace. `JSON.parse` chokes on both.
    it('accepts a payload with a leading UTF-8 BOM', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      expect(isValidEncryptedPayload('\uFEFF' + encrypted)).toBe(true);
    });

    it('accepts a payload with leading and trailing whitespace/newlines', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      expect(isValidEncryptedPayload('\n\n  ' + encrypted + '  \n')).toBe(true);
    });

    it('accepts a payload wrapped in both a BOM and whitespace', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      expect(isValidEncryptedPayload('\uFEFF\n' + encrypted + '\n')).toBe(true);
    });
  });

  describe('validateEncryptedPayload', () => {
    it('returns { valid: true } for a well-formed payload', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      expect(validateEncryptedPayload(encrypted)).toEqual({ valid: true });
    });

    it('returns reason "empty" for empty string', () => {
      expect(validateEncryptedPayload('')).toEqual({
        valid: false,
        reason: 'empty',
      });
    });

    it('returns reason "empty" for whitespace-only input', () => {
      expect(validateEncryptedPayload('   \n\t  ')).toEqual({
        valid: false,
        reason: 'empty',
      });
    });

    it('returns reason "empty" for BOM-only input', () => {
      expect(validateEncryptedPayload('\uFEFF')).toEqual({
        valid: false,
        reason: 'empty',
      });
    });

    it('returns reason "not_json" for non-JSON content', () => {
      expect(validateEncryptedPayload('not json at all')).toEqual({
        valid: false,
        reason: 'not_json',
      });
    });

    it('returns reason "missing_fields" when required keys are absent', () => {
      expect(validateEncryptedPayload('{"hello": "world"}')).toEqual({
        valid: false,
        reason: 'missing_fields',
      });
    });

    it('returns reason "missing_fields" when required keys are the wrong type', () => {
      expect(
        validateEncryptedPayload('{"salt": 1, "iv": 2, "ciphertext": 3}')
      ).toEqual({ valid: false, reason: 'missing_fields' });
    });

    it('accepts a BOM-prefixed payload', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      expect(validateEncryptedPayload('\uFEFF' + encrypted)).toEqual({
        valid: true,
      });
    });

    it('accepts a whitespace-padded payload', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      expect(validateEncryptedPayload('\n  ' + encrypted + '\n')).toEqual({
        valid: true,
      });
    });

    it('tolerates null/undefined input gracefully', () => {
      expect(
        validateEncryptedPayload(null as unknown as string)
      ).toEqual({ valid: false, reason: 'empty' });
      expect(
        validateEncryptedPayload(undefined as unknown as string)
      ).toEqual({ valid: false, reason: 'empty' });
    });
  });

  describe('decryptData — input normalization regressions', () => {
    it('round-trips through a BOM-prefixed payload', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      const decrypted = await decryptData('\uFEFF' + encrypted, passphrase);
      expect(decrypted).toBe(plaintext);
    });

    it('round-trips through a whitespace-padded payload', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      const decrypted = await decryptData(
        '\n\n  ' + encrypted + '  \n',
        passphrase
      );
      expect(decrypted).toBe(plaintext);
    });

    it('round-trips through a BOM + whitespace payload', async () => {
      const encrypted = await encryptData(plaintext, passphrase);
      const decrypted = await decryptData(
        '\uFEFF\n  ' + encrypted + '  \n',
        passphrase
      );
      expect(decrypted).toBe(plaintext);
    });

    it('throws "file is empty" for empty input (instead of a parse error)', async () => {
      await expect(decryptData('', passphrase)).rejects.toThrow('file is empty');
    });

    it('throws "file is empty" for whitespace-only input', async () => {
      await expect(decryptData('   \n\t  ', passphrase)).rejects.toThrow(
        'file is empty'
      );
    });

    it('throws "file is empty" for BOM-only input', async () => {
      await expect(decryptData('\uFEFF', passphrase)).rejects.toThrow(
        'file is empty'
      );
    });
  });
});
