/**
 * Tests untuk Input Sanitizer Module
 */

import {
  stripHtml,
  escapeHtml,
  sanitizeString,
  sanitizeEmail,
  sanitizeDisplayName,
  sanitizePath,
  isValidUUID,
  sanitizeObject,
  detectSuspiciousInput,
} from '../../../src/security/input-sanitizer';

describe('Input Sanitizer', () => {
  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<b>bold</b>')).toBe('bold');
      expect(stripHtml('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('should handle string without HTML', () => {
      expect(stripHtml('plain text')).toBe('plain text');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('"quotes"')).toBe('&quot;quotes&quot;');
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should strip HTML tags', () => {
      expect(sanitizeString('<b>test</b>')).toBe('test');
    });

    it('should remove null bytes', () => {
      expect(sanitizeString('hello\0world')).toBe('helloworld');
    });

    it('should truncate to max length', () => {
      const long = 'a'.repeat(2000);
      expect(sanitizeString(long, 100).length).toBe(100);
    });

    it('should handle non-string input', () => {
      expect(sanitizeString(123 as any)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase email', () => {
      expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  user@test.com  ')).toBe('user@test.com');
    });

    it('should remove invalid characters', () => {
      expect(sanitizeEmail('user<script>@test.com')).toBe('user@test.com');
    });
  });

  describe('sanitizeDisplayName', () => {
    it('should allow normal names', () => {
      expect(sanitizeDisplayName('John Doe')).toBe('John Doe');
    });

    it('should allow unicode characters', () => {
      expect(sanitizeDisplayName('Budi Santoso')).toBe('Budi Santoso');
    });

    it('should remove special characters', () => {
      expect(sanitizeDisplayName('user<script>')).toBe('user');
    });

    it('should truncate to 50 chars', () => {
      const long = 'a'.repeat(100);
      expect(sanitizeDisplayName(long).length).toBeLessThanOrEqual(50);
    });
  });

  describe('sanitizePath', () => {
    it('should remove path traversal', () => {
      expect(sanitizePath('../../../etc/passwd')).toBe('/etc/passwd');
    });

    it('should normalize slashes', () => {
      expect(sanitizePath('path\\to\\file')).toBe('path/to/file');
    });
  });

  describe('isValidUUID', () => {
    it('should accept valid UUID', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUID', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('12345')).toBe(false);
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string values', () => {
      const obj = { name: '<b>test</b>', age: 25 };
      const result = sanitizeObject(obj);
      expect(result.name).toBe('test');
      expect(result.age).toBe(25);
    });

    it('should handle nested objects', () => {
      const obj = { user: { name: '<script>xss</script>' } };
      const result = sanitizeObject(obj);
      expect(result.user.name).toBe('xss');
    });

    it('should handle arrays', () => {
      const obj = { tags: ['<b>tag1</b>', 'tag2'] };
      const result = sanitizeObject(obj);
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('detectSuspiciousInput', () => {
    it('should detect SQL injection patterns', () => {
      expect(detectSuspiciousInput("' OR 1=1; SELECT * FROM users")).toBe(true);
    });

    it('should detect XSS patterns', () => {
      expect(detectSuspiciousInput('<script>alert("xss")</script>')).toBe(true);
    });

    it('should not flag normal input', () => {
      expect(detectSuspiciousInput('Hello, my name is John')).toBe(false);
    });
  });
});
