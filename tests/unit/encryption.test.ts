import { describe, it, expect } from 'vitest';
import { encryptData, decryptData, isValidEncryptedPayload } from '@/lib/encryption';

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
  });
});
