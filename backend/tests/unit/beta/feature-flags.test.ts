/**
 * Tests untuk Feature Flags System
 */

jest.mock('../../../src/config/redis', () => ({
  redis: {
    keys: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    smembers: jest.fn().mockResolvedValue([]),
    sadd: jest.fn().mockResolvedValue(1),
    srem: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
  },
  REDIS_KEYS: {},
}));

import { featureFlags } from '../../../src/beta/feature-flags';

describe('FeatureFlagService', () => {
  beforeEach(async () => {
    // Re-initialize to reset state
    await featureFlags.initialize();
  });

  describe('isEnabled', () => {
    it('should return true for enabled flags with 100% rollout', () => {
      expect(featureFlags.isEnabled('matching.enabled')).toBe(true);
    });

    it('should return false for disabled flags', () => {
      expect(featureFlags.isEnabled('matching.smart_algorithm')).toBe(false);
    });

    it('should return false for non-existent flags', () => {
      expect(featureFlags.isEnabled('non.existent.flag')).toBe(false);
    });

    it('should return false for beta-only flags when user is not beta', () => {
      // matching.smart_algorithm is betaOnly and disabled
      expect(featureFlags.isEnabled('matching.smart_algorithm', 'regular-user')).toBe(false);
    });

    it('should return true for enabled beta flags when user is beta', async () => {
      await featureFlags.addBetaUser('beta-user-1');

      // First enable the flag
      await featureFlags.setFlag('matching.smart_algorithm', {
        enabled: true,
        rolloutPercentage: 100,
      });

      expect(featureFlags.isEnabled('matching.smart_algorithm', 'beta-user-1')).toBe(true);
    });
  });

  describe('addBetaUser / removeBetaUser', () => {
    it('should add and check beta user', async () => {
      await featureFlags.addBetaUser('user-123');
      expect(featureFlags.isBetaUser('user-123')).toBe(true);
    });

    it('should remove beta user', async () => {
      await featureFlags.addBetaUser('user-456');
      expect(featureFlags.isBetaUser('user-456')).toBe(true);

      await featureFlags.removeBetaUser('user-456');
      expect(featureFlags.isBetaUser('user-456')).toBe(false);
    });

    it('should return false for non-beta user', () => {
      expect(featureFlags.isBetaUser('random-user')).toBe(false);
    });
  });

  describe('setFlag', () => {
    it('should update flag properties', async () => {
      await featureFlags.setFlag('coins.gifting', { enabled: false });
      expect(featureFlags.isEnabled('coins.gifting')).toBe(false);
    });

    it('should persist to redis', async () => {
      const { redis } = require('../../../src/config/redis');
      await featureFlags.setFlag('coins.gifting', { enabled: false });
      expect(redis.set).toHaveBeenCalled();
    });
  });

  describe('getAllFlags', () => {
    it('should return all flags with enabled status', () => {
      const flags = featureFlags.getAllFlags();
      expect(flags).toBeDefined();
      expect(flags['matching.enabled']).toBeDefined();
      expect(flags['matching.enabled'].enabled).toBe(true);
      expect(flags['matching.enabled'].description).toBeDefined();
    });

    it('should return user-specific flag status', async () => {
      await featureFlags.addBetaUser('beta-user');
      const flags = featureFlags.getAllFlags('beta-user');
      expect(flags).toBeDefined();
    });
  });

  describe('getBetaUsersCount', () => {
    it('should return correct count', async () => {
      await featureFlags.addBetaUser('u1');
      await featureFlags.addBetaUser('u2');
      expect(featureFlags.getBetaUsersCount()).toBeGreaterThanOrEqual(2);
    });
  });
});
