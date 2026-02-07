/**
 * Feature Flags System
 * 
 * Mengontrol fitur yang aktif/nonaktif tanpa deploy ulang:
 * - Toggle fitur per environment
 * - Gradual rollout (percentage-based)
 * - User-specific flags (beta testers)
 * - A/B testing support
 */

import { redis } from '../config/redis';
import { createLogger } from '../utils/logger';

const logger = createLogger('FeatureFlags');

const REDIS_PREFIX = 'ff:';

interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  rolloutPercentage: number; // 0-100
  betaOnly: boolean;
  allowedUsers: string[]; // User IDs yang diizinkan
  metadata?: Record<string, any>;
}

// Default feature flags
const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  // Core features
  'matching.enabled': {
    name: 'matching.enabled',
    enabled: true,
    description: 'Fitur matchmaking utama',
    rolloutPercentage: 100,
    betaOnly: false,
    allowedUsers: [],
  },
  'matching.smart_algorithm': {
    name: 'matching.smart_algorithm',
    enabled: false,
    description: 'Smart matching berdasarkan behavior similarity',
    rolloutPercentage: 0,
    betaOnly: true,
    allowedUsers: [],
  },

  // Monetization
  'coins.gifting': {
    name: 'coins.gifting',
    enabled: true,
    description: 'Kirim hadiah koin saat sesi',
    rolloutPercentage: 100,
    betaOnly: false,
    allowedUsers: [],
  },
  'coins.withdrawal': {
    name: 'coins.withdrawal',
    enabled: false,
    description: 'Penarikan koin ke uang nyata',
    rolloutPercentage: 0,
    betaOnly: true,
    allowedUsers: [],
  },
  'premium.subscription': {
    name: 'premium.subscription',
    enabled: false,
    description: 'Fitur langganan premium',
    rolloutPercentage: 0,
    betaOnly: true,
    allowedUsers: [],
  },

  // Social
  'friends.add_after_session': {
    name: 'friends.add_after_session',
    enabled: true,
    description: 'Tambah teman setelah sesi',
    rolloutPercentage: 100,
    betaOnly: false,
    allowedUsers: [],
  },
  'friends.direct_call': {
    name: 'friends.direct_call',
    enabled: false,
    description: 'Video call langsung dengan teman',
    rolloutPercentage: 0,
    betaOnly: true,
    allowedUsers: [],
  },

  // Safety
  'moderation.ai_content_detection': {
    name: 'moderation.ai_content_detection',
    enabled: false,
    description: 'Deteksi konten AI real-time',
    rolloutPercentage: 0,
    betaOnly: true,
    allowedUsers: [],
  },
  'moderation.auto_ban': {
    name: 'moderation.auto_ban',
    enabled: true,
    description: 'Auto-ban berdasarkan report threshold',
    rolloutPercentage: 100,
    betaOnly: false,
    allowedUsers: [],
  },

  // Beta-specific
  'beta.feedback_prompt': {
    name: 'beta.feedback_prompt',
    enabled: true,
    description: 'Prompt feedback untuk beta testers',
    rolloutPercentage: 100,
    betaOnly: true,
    allowedUsers: [],
  },
  'beta.debug_overlay': {
    name: 'beta.debug_overlay',
    enabled: false,
    description: 'Debug overlay di mobile app',
    rolloutPercentage: 0,
    betaOnly: true,
    allowedUsers: [],
  },
};

class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private betaUsers: Set<string> = new Set();

  constructor() {
    // Load defaults
    Object.entries(DEFAULT_FLAGS).forEach(([key, flag]) => {
      this.flags.set(key, { ...flag });
    });
  }

  /**
   * Initialize flags from Redis (jika ada override)
   */
  async initialize(): Promise<void> {
    try {
      const keys = await redis.keys(`${REDIS_PREFIX}*`);
      for (const key of keys) {
        const flagName = key.replace(REDIS_PREFIX, '');
        const data = await redis.get(key);
        if (data) {
          const override = JSON.parse(data) as Partial<FeatureFlag>;
          const existing = this.flags.get(flagName);
          if (existing) {
            this.flags.set(flagName, { ...existing, ...override });
          }
        }
      }

      // Load beta users
      const betaUsersList = await redis.smembers('beta:users');
      betaUsersList.forEach((id: string) => this.betaUsers.add(id));

      logger.info(`Feature flags initialized: ${this.flags.size} flags, ${this.betaUsers.size} beta users`);
    } catch (error) {
      logger.warn('Failed to load feature flags from Redis, using defaults:', error);
    }
  }

  /**
   * Check apakah fitur aktif untuk user tertentu
   */
  isEnabled(flagName: string, userId?: string): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) return false;

    // Flag disabled secara global
    if (!flag.enabled) return false;

    // Beta-only flag - cek apakah user adalah beta tester
    if (flag.betaOnly && userId && !this.betaUsers.has(userId)) {
      return false;
    }

    // Cek allowed users
    if (flag.allowedUsers.length > 0 && userId) {
      return flag.allowedUsers.includes(userId);
    }

    // Percentage rollout
    if (flag.rolloutPercentage < 100 && userId) {
      const hash = this.hashUserId(userId, flagName);
      return hash < flag.rolloutPercentage;
    }

    return flag.rolloutPercentage > 0;
  }

  /**
   * Deterministic hash untuk percentage rollout
   */
  private hashUserId(userId: string, flagName: string): number {
    let hash = 0;
    const str = `${userId}:${flagName}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 100;
  }

  /**
   * Update flag (persist ke Redis)
   */
  async setFlag(flagName: string, updates: Partial<FeatureFlag>): Promise<void> {
    const existing = this.flags.get(flagName);
    if (!existing) {
      logger.warn(`Flag not found: ${flagName}`);
      return;
    }

    const updated = { ...existing, ...updates };
    this.flags.set(flagName, updated);

    await redis.set(`${REDIS_PREFIX}${flagName}`, JSON.stringify(updates));
    logger.info(`Flag updated: ${flagName}`, updates);
  }

  /**
   * Add beta tester
   */
  async addBetaUser(userId: string): Promise<void> {
    this.betaUsers.add(userId);
    await redis.sadd('beta:users', userId);
    logger.info(`Beta user added: ${userId}`);
  }

  /**
   * Remove beta tester
   */
  async removeBetaUser(userId: string): Promise<void> {
    this.betaUsers.delete(userId);
    await redis.srem('beta:users', userId);
    logger.info(`Beta user removed: ${userId}`);
  }

  /**
   * Check if user is beta tester
   */
  isBetaUser(userId: string): boolean {
    return this.betaUsers.has(userId);
  }

  /**
   * Get all flags with status for a specific user
   */
  getAllFlags(userId?: string): Record<string, { enabled: boolean; description: string }> {
    const result: Record<string, { enabled: boolean; description: string }> = {};
    this.flags.forEach((flag, name) => {
      result[name] = {
        enabled: this.isEnabled(name, userId),
        description: flag.description,
      };
    });
    return result;
  }

  /**
   * Get beta users count
   */
  getBetaUsersCount(): number {
    return this.betaUsers.size;
  }
}

export const featureFlags = new FeatureFlagService();
