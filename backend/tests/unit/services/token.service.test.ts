/**
 * Tests untuk Token Service
 */

// Mock config before import
jest.mock('../../../src/config', () => ({
  config: {
    jwt: {
      secret: 'test-jwt-secret-minimum-32-characters-long',
      accessExpires: '15m',
      refreshExpires: '7d',
    },
  },
}));

jest.mock('../../../src/config/redis', () => ({
  redis: {
    setex: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
  },
  REDIS_KEYS: {
    REFRESH_TOKEN: (userId: string) => `token:refresh:${userId}`,
  },
}));

import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  generateTokenPair,
  TokenPayload,
} from '../../../src/services/token.service';

describe('TokenService', () => {
  const testPayload: TokenPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  describe('generateAccessToken / verifyAccessToken', () => {
    it('should generate and verify a valid access token', () => {
      const token = generateAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts

      const verified = verifyAccessToken(token);
      expect(verified).not.toBeNull();
      expect(verified!.userId).toBe('user-123');
      expect(verified!.email).toBe('test@example.com');
      expect(verified!.displayName).toBe('Test User');
    });

    it('should return null for invalid token', () => {
      const result = verifyAccessToken('invalid.token.here');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = verifyAccessToken('');
      expect(result).toBeNull();
    });

    it('should return null for tampered token', () => {
      const token = generateAccessToken(testPayload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      const result = verifyAccessToken(tampered);
      expect(result).toBeNull();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token and store in Redis', async () => {
      const { redis } = require('../../../src/config/redis');

      const token = await generateRefreshToken('user-123');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      // Should store token ID in Redis
      expect(redis.setex).toHaveBeenCalledWith(
        'token:refresh:user-123',
        expect.any(Number),
        expect.any(String)
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token with matching Redis entry', async () => {
      const { redis } = require('../../../src/config/redis');

      const token = await generateRefreshToken('user-456');

      // Extract tokenId from the setex call to mock Redis return
      const storedTokenId = redis.setex.mock.calls[redis.setex.mock.calls.length - 1][2];
      redis.get.mockResolvedValueOnce(storedTokenId);

      const userId = await verifyRefreshToken(token);
      expect(userId).toBe('user-456');
    });

    it('should return null for token with mismatched Redis entry', async () => {
      const { redis } = require('../../../src/config/redis');

      const token = await generateRefreshToken('user-789');
      redis.get.mockResolvedValueOnce('different-token-id');

      const userId = await verifyRefreshToken(token);
      expect(userId).toBeNull();
    });

    it('should return null for invalid refresh token', async () => {
      const userId = await verifyRefreshToken('invalid-token');
      expect(userId).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should delete refresh token from Redis', async () => {
      const { redis } = require('../../../src/config/redis');

      await revokeRefreshToken('user-123');
      expect(redis.del).toHaveBeenCalledWith('token:refresh:user-123');
    });
  });

  describe('generateTokenPair', () => {
    it('should return access token, refresh token, and expiry', async () => {
      const pair = await generateTokenPair(testPayload);

      expect(pair.accessToken).toBeDefined();
      expect(pair.refreshToken).toBeDefined();
      expect(pair.expiresIn).toBe(900); // 15 minutes
      expect(typeof pair.accessToken).toBe('string');
      expect(typeof pair.refreshToken).toBe('string');
    });

    it('should generate verifiable access token', async () => {
      const pair = await generateTokenPair(testPayload);
      const verified = verifyAccessToken(pair.accessToken);
      expect(verified).not.toBeNull();
      expect(verified!.userId).toBe('user-123');
    });
  });
});
