/**
 * Encryption utilities for backup files.
 * Uses AES-256-GCM via Web Crypto API — no external dependencies.
 *
 * Flow:
 *   passphrase → PBKDF2 → AES-256-GCM key → encrypt/decrypt
 *
 * Output format (base64-encoded JSON):
 *   { salt: base64, iv: base64, ciphertext: base64 }
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const SALT_LENGTH = 16; // 128-bit salt
const PBKDF2_ITERATIONS = 600_000; // OWASP 2023 recommendation

/**
 * Encrypted payload structure.
 */
export interface EncryptedPayload {
  salt: string; // base64
  iv: string; // base64
  ciphertext: string; // base64
}

/**
 * Structured validation result for encrypted backup payloads.
 * The `reason` code lets callers show actionable error messages
 * instead of a single generic "not a valid backup file" string.
 */
export type EncryptedPayloadValidation =
  | { valid: true }
  | { valid: false; reason: 'empty' | 'not_json' | 'missing_fields' };

/**
 * Normalize a backup file's raw contents before JSON parsing.
 *
 * Real-world backup files picked up via AirDrop, email, cloud sync,
 * Android's Downloads provider, or a phone→laptop transfer can pick
 * up a UTF-8 BOM (`\uFEFF`) or surrounding whitespace/newlines.
 * `JSON.parse` treats both as syntax errors, so without this the
 * file validates as "not a valid HomeDocket backup file" even though
 * the payload underneath is perfectly fine.
 */
function stripBomAndTrim(input: string): string {
  if (!input) return input;
  const withoutBom = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  return withoutBom.trim();
}

/**
 * Derive an AES-256-GCM key from a passphrase using PBKDF2.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Convert a Uint8Array to a base64 string.
 */
function toBase64(buffer: Uint8Array): string {
  const bytes = Array.from(buffer);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Convert a base64 string to a Uint8Array.
 */
function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt plaintext with a passphrase using AES-256-GCM.
 *
 * @param plaintext - The string to encrypt
 * @param passphrase - User-provided passphrase
 * @returns JSON string of EncryptedPayload (salt + iv + ciphertext, all base64)
 */
export async function encryptData(plaintext: string, passphrase: string): Promise<string> {
  if (!passphrase) {
    throw new Error('Passphrase is required for encryption');
  }

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv as BufferSource },
    key,
    encoder.encode(plaintext)
  );

  const payload: EncryptedPayload = {
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(encrypted)),
  };

  return JSON.stringify(payload);
}

/**
 * Decrypt ciphertext with a passphrase using AES-256-GCM.
 *
 * @param encryptedJson - JSON string of EncryptedPayload
 * @param passphrase - User-provided passphrase
 * @returns The original plaintext
 * @throws Error if passphrase is wrong or data is corrupted
 */
export async function decryptData(encryptedJson: string, passphrase: string): Promise<string> {
  if (!passphrase) {
    throw new Error('Passphrase is required for decryption');
  }

  const normalized = stripBomAndTrim(encryptedJson);

  if (!normalized) {
    throw new Error('Invalid backup file format: file is empty');
  }

  let payload: EncryptedPayload;
  try {
    payload = JSON.parse(normalized) as EncryptedPayload;
  } catch {
    throw new Error('Invalid backup file format');
  }

  if (
    typeof payload?.salt !== 'string' ||
    typeof payload?.iv !== 'string' ||
    typeof payload?.ciphertext !== 'string'
  ) {
    throw new Error('Invalid backup file format: missing required fields');
  }

  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const ciphertext = fromBase64(payload.ciphertext);
  const key = await deriveKey(passphrase, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv as BufferSource },
      key,
      ciphertext as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch {
    throw new Error('Decryption failed: wrong passphrase or corrupted data');
  }
}

/**
 * Validate that an encrypted payload has the expected envelope structure
 * and return a structured reason so callers can show actionable errors.
 *
 * Tolerates a leading UTF-8 BOM and surrounding whitespace — these are
 * commonly introduced when backup files travel through email, cloud
 * sync, or Android's Downloads provider between phone and laptop.
 *
 * Does NOT attempt decryption — just checks the envelope.
 */
export function validateEncryptedPayload(data: string): EncryptedPayloadValidation {
  const normalized = stripBomAndTrim(data ?? '');

  if (!normalized) {
    return { valid: false, reason: 'empty' };
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(normalized) as Record<string, unknown>;
  } catch {
    return { valid: false, reason: 'not_json' };
  }

  if (
    typeof parsed?.salt !== 'string' ||
    typeof parsed?.iv !== 'string' ||
    typeof parsed?.ciphertext !== 'string'
  ) {
    return { valid: false, reason: 'missing_fields' };
  }

  return { valid: true };
}

/**
 * Boolean convenience wrapper around `validateEncryptedPayload`.
 * Kept for call sites that only need a yes/no answer.
 */
export function isValidEncryptedPayload(data: string): boolean {
  return validateEncryptedPayload(data).valid;
}
