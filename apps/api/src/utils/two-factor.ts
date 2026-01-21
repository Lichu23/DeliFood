/**
 * Two-Factor Authentication (2FA) Foundation
 *
 * This module provides the foundation for TOTP-based 2FA.
 * To fully implement:
 * 1. Install: npm install otplib qrcode @types/qrcode
 * 2. Add twoFactorSecret and twoFactorEnabled to User model
 * 3. Create enable/disable 2FA endpoints
 * 4. Integrate verification into login flow
 */

import crypto from 'crypto';

// Constants for TOTP
const TOTP_CONFIG = {
  // Time step in seconds (standard is 30)
  step: 30,
  // Number of digits in the code
  digits: 6,
  // Algorithm for HMAC
  algorithm: 'sha1' as const,
  // Window for code validation (allows 1 step before/after)
  window: 1,
};

/**
 * Generate a random secret for 2FA
 * Returns a base32-encoded string
 */
export function generateTwoFactorSecret(): string {
  // Generate 20 random bytes (160 bits, standard for TOTP)
  const buffer = crypto.randomBytes(20);

  // Convert to base32 (RFC 4648)
  return base32Encode(buffer);
}

/**
 * Generate the otpauth:// URI for QR code
 * This URI can be scanned by authenticator apps
 */
export function generateTwoFactorUri(
  secret: string,
  email: string,
  issuer: string = 'DeliFood'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);

  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${TOTP_CONFIG.algorithm.toUpperCase()}&digits=${TOTP_CONFIG.digits}&period=${TOTP_CONFIG.step}`;
}

/**
 * Verify a TOTP code
 * Returns true if the code is valid
 */
export function verifyTwoFactorCode(secret: string, code: string): boolean {
  if (!code || code.length !== TOTP_CONFIG.digits) {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);

  // Check current time step and window steps before/after
  for (let i = -TOTP_CONFIG.window; i <= TOTP_CONFIG.window; i++) {
    const timeStep = Math.floor((currentTime + i * TOTP_CONFIG.step) / TOTP_CONFIG.step);
    const expectedCode = generateTotpCode(secret, timeStep);

    if (timingSafeEqual(code, expectedCode)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate a TOTP code for a given time step
 */
function generateTotpCode(secret: string, timeStep: number): string {
  // Decode base32 secret
  const key = base32Decode(secret);

  // Convert time step to 8-byte buffer (big-endian)
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep));

  // Generate HMAC
  const hmac = crypto.createHmac(TOTP_CONFIG.algorithm, key);
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  // Dynamic truncation (RFC 4226)
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  // Generate code with specified digits
  const code = binary % Math.pow(10, TOTP_CONFIG.digits);
  return code.toString().padStart(TOTP_CONFIG.digits, '0');
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Base32 encoding (RFC 4648)
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let result = '';
  let bits = 0;
  let value = 0;

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(value >> bits) & 0x1f];
    }
  }

  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }

  return result;
}

function base32Decode(encoded: string): Buffer {
  const cleaned = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >> bits) & 0xff);
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate backup codes for 2FA recovery
 * Returns an array of one-time use codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }

  return codes;
}

/**
 * Hash a backup code for storage
 * Backup codes should be stored hashed, not in plain text
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.replace('-', '')).digest('hex');
}

/**
 * Verify a backup code against stored hashes
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const codeHash = hashBackupCode(code);
  return hashedCodes.some((hash) => timingSafeEqual(codeHash, hash));
}

// Type definitions for future use
export interface TwoFactorSetup {
  secret: string;
  uri: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  usedBackupCode?: boolean;
}
