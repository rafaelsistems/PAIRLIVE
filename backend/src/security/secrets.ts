/**
 * Secrets Manager
 * 
 * Mengelola secrets dan sensitive data dengan aman.
 * - Validasi secrets saat startup
 * - Enkripsi/dekripsi data sensitif
 * - Rotasi token support
 */

import crypto from 'crypto';
import { createLogger } from '../utils/logger';

const logger = createLogger('SecretsManager');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Validasi bahwa semua secrets yang diperlukan sudah dikonfigurasi
 * dan memenuhi standar keamanan minimum
 */
export function validateSecrets(): void {
  const env = process.env.NODE_ENV || 'development';
  const errors: string[] = [];
  const warnings: string[] = [];

  // JWT Secret validation
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'super-secret-key-change-in-production') {
    if (env === 'production') {
      errors.push('JWT_SECRET harus dikonfigurasi dengan nilai yang aman di production');
    } else {
      warnings.push('JWT_SECRET menggunakan nilai default - jangan gunakan di production');
    }
  } else if (jwtSecret.length < 32) {
    warnings.push('JWT_SECRET sebaiknya minimal 32 karakter');
  }

  // Database URL validation
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    errors.push('DATABASE_URL harus dikonfigurasi');
  } else if (env === 'production' && dbUrl.includes('localhost')) {
    warnings.push('DATABASE_URL mengarah ke localhost di production');
  }

  // Redis URL validation
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    warnings.push('REDIS_URL tidak dikonfigurasi, menggunakan default');
  }

  // SMTP validation for production
  if (env === 'production') {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      warnings.push('SMTP belum dikonfigurasi - fitur email tidak akan berfungsi');
    }
  }

  // CORS validation for production
  if (env === 'production' && process.env.CORS_ORIGIN === '*') {
    warnings.push('CORS_ORIGIN = * di production - sebaiknya batasi origin');
  }

  // Log warnings
  warnings.forEach((w) => logger.warn(`⚠️  ${w}`));

  // Throw on errors
  if (errors.length > 0) {
    errors.forEach((e) => logger.error(`❌ ${e}`));
    throw new Error(
      `Security validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }

  logger.info('✅ Secrets validation passed');
}

/**
 * Generate cryptographically secure random string
 */
export function generateSecureToken(length: number = 48): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate secure random bytes as base64
 */
export function generateSecureBytes(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Derive encryption key from password using PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive data (e.g., PII, tokens for storage)
 */
export function encrypt(plaintext: string, encryptionKey?: string): string {
  const key = encryptionKey || process.env.JWT_SECRET || 'default-key';
  const salt = crypto.randomBytes(SALT_LENGTH);
  const derivedKey = deriveKey(key, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypt sensitive data
 */
export function decrypt(ciphertext: string, encryptionKey?: string): string {
  const key = encryptionKey || process.env.JWT_SECRET || 'default-key';
  const buffer = Buffer.from(ciphertext, 'base64');

  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const derivedKey = deriveKey(key, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final('utf8');
}

/**
 * Hash data with SHA-256 (one-way, for fingerprinting)
 */
export function hashSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Mask sensitive data for logging (e.g., email, token)
 */
export function maskSensitive(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) return '***';
  return value.substring(0, visibleChars) + '***' + value.substring(value.length - 2);
}

/**
 * Sanitize object by removing sensitive fields before logging
 */
export function sanitizeForLog(obj: Record<string, any>, sensitiveFields: string[] = [
  'password', 'passwordHash', 'token', 'refreshToken', 'accessToken',
  'secret', 'credential', 'apiKey', 'authorization',
]): Record<string, any> {
  const sanitized = { ...obj };
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
}
