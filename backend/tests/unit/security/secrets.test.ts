/**
 * Tests untuk Security Secrets Module
 */

import {
  generateSecureToken,
  generateSecureBytes,
  encrypt,
  decrypt,
  hashSHA256,
  secureCompare,
  maskSensitive,
  sanitizeForLog,
} from '../../../src/security/secrets';

describe('Security Secrets', () => {
  describe('generateSecureToken', () => {
    it('should generate token with default length', () => {
      const token = generateSecureToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(96); // 48 bytes = 96 hex chars
    });

    it('should generate token with custom length', () => {
      const token = generateSecureToken(16);
      expect(token.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateSecureBytes', () => {
    it('should generate base64url encoded bytes', () => {
      const bytes = generateSecureBytes();
      expect(bytes).toBeDefined();
      expect(typeof bytes).toBe('string');
    });

    it('should generate unique values', () => {
      const bytes1 = generateSecureBytes();
      const bytes2 = generateSecureBytes();
      expect(bytes1).not.toBe(bytes2);
    });
  });

  describe('encrypt / decrypt', () => {
    const testKey = 'test-encryption-key-32-characters!';

    it('should encrypt and decrypt correctly', () => {
      const plaintext = 'Hello, PAIRLIVE!';
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext', () => {
      const plaintext = 'same text';
      const encrypted1 = encrypt(plaintext, testKey);
      const encrypted2 = encrypt(plaintext, testKey);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should fail with wrong key', () => {
      const plaintext = 'secret data';
      const encrypted = encrypt(plaintext, testKey);
      expect(() => decrypt(encrypted, 'wrong-key')).toThrow();
    });

    it('should handle empty string', () => {
      const encrypted = encrypt('', testKey);
      const decrypted = decrypt(encrypted, testKey);
      expect(decrypted).toBe('');
    });

    it('should handle unicode characters', () => {
      const plaintext = 'こんにちは世界 🌍';
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('hashSHA256', () => {
    it('should produce consistent hash', () => {
      const hash1 = hashSHA256('test');
      const hash2 = hashSHA256('test');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', () => {
      const hash1 = hashSHA256('test1');
      const hash2 = hashSHA256('test2');
      expect(hash1).not.toBe(hash2);
    });

    it('should return 64 character hex string', () => {
      const hash = hashSHA256('test');
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });
  });

  describe('secureCompare', () => {
    it('should return true for equal strings', () => {
      expect(secureCompare('abc', 'abc')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(secureCompare('abc', 'abd')).toBe(false);
    });

    it('should return false for different lengths', () => {
      expect(secureCompare('abc', 'abcd')).toBe(false);
    });
  });

  describe('maskSensitive', () => {
    it('should mask long strings', () => {
      const masked = maskSensitive('user@example.com');
      expect(masked).toBe('user***om');
    });

    it('should mask short strings', () => {
      const masked = maskSensitive('ab');
      expect(masked).toBe('***');
    });

    it('should respect custom visible chars', () => {
      const masked = maskSensitive('abcdefgh', 2);
      expect(masked).toBe('ab***gh');
    });
  });

  describe('sanitizeForLog', () => {
    it('should redact sensitive fields', () => {
      const obj = {
        email: 'user@test.com',
        password: 'secret123',
        token: 'jwt-token',
        name: 'John',
      };
      const sanitized = sanitizeForLog(obj);
      expect(sanitized.email).toBe('user@test.com');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.name).toBe('John');
    });

    it('should not modify original object', () => {
      const obj = { password: 'secret' };
      sanitizeForLog(obj);
      expect(obj.password).toBe('secret');
    });
  });
});
