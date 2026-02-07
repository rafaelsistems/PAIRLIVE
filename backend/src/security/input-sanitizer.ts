/**
 * Input Sanitizer
 * 
 * Sanitasi dan validasi input untuk mencegah:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection (ditangani Prisma, ini sebagai lapisan tambahan)
 * - NoSQL Injection
 * - Path Traversal
 */

import { createLogger } from '../utils/logger';

const logger = createLogger('InputSanitizer');

/**
 * Hapus HTML tags dari string
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML entities
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize string input - hapus karakter berbahaya
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  sanitized = stripHtml(sanitized);
  
  // Hapus null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Batasi panjang
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9@._+-]/g, '');
}

/**
 * Validasi dan sanitize display name
 */
export function sanitizeDisplayName(name: string): string {
  let sanitized = sanitizeString(name, 50);
  // Hanya izinkan huruf, angka, spasi, dan beberapa karakter khusus
  sanitized = sanitized.replace(/[^\p{L}\p{N}\s._-]/gu, '');
  return sanitized;
}

/**
 * Sanitize path untuk mencegah path traversal
 */
export function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, '')
    .replace(/\/\//g, '/')
    .replace(/\\/g, '/');
}

/**
 * Validasi UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Sanitize object secara rekursif
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Deteksi potensi injection patterns
 */
export function detectSuspiciousInput(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b.*\b(FROM|INTO|TABLE|SET)\b)/i,
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\$\{.*\}/,
    /\{\{.*\}\}/,
  ];
  
  return patterns.some((pattern) => pattern.test(input));
}

/**
 * Log suspicious input untuk monitoring
 */
export function logSuspiciousInput(
  source: string,
  input: string,
  ip: string
): void {
  if (detectSuspiciousInput(input)) {
    logger.warn({
      event: 'suspicious_input',
      source,
      ip,
      inputPreview: input.substring(0, 100),
    });
  }
}
