import Redis from 'ioredis';
import { logger } from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redis.on('connect', () => {
  logger.info('Redis terhubung');
});

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

redis.on('close', () => {
  logger.warn('Koneksi Redis ditutup');
});

// Prefix key Redis
export const REDIS_KEYS = {
  // Antrian matching
  MATCHING_QUEUE: 'matching:queue',
  MATCHING_USER: (userId: string) => `matching:user:${userId}`,
  
  // Sesi
  ACTIVE_SESSION: (sessionId: string) => `session:active:${sessionId}`,
  USER_SESSION: (userId: string) => `session:user:${userId}`,
  
  // Status online pengguna
  USER_ONLINE: (userId: string) => `user:online:${userId}`,
  
  // Rate limiting
  RATE_LIMIT: (key: string) => `ratelimit:${key}`,
  
  // Token
  REFRESH_TOKEN: (userId: string) => `token:refresh:${userId}`,
  
  // Cache
  USER_PROFILE: (userId: string) => `cache:user:${userId}`,
  
  // Socket
  USER_SOCKET: (userId: string) => `socket:user:${userId}`,
} as const;

// Fungsi helper
export const redisHelpers = {
  // Simpan dengan expiry
  async setWithExpiry(key: string, value: string, expirySeconds: number): Promise<void> {
    await redis.setex(key, expirySeconds, value);
  },

  // Simpan JSON dengan expiry opsional
  async setJSON(key: string, value: object, expirySeconds?: number): Promise<void> {
    const json = JSON.stringify(value);
    if (expirySeconds) {
      await redis.setex(key, expirySeconds, json);
    } else {
      await redis.set(key, json);
    }
  },

  // Ambil dan parse JSON
  async getJSON<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  // Tambah ke set
  async addToSet(key: string, value: string): Promise<void> {
    await redis.sadd(key, value);
  },

  // Hapus dari set
  async removeFromSet(key: string, value: string): Promise<void> {
    await redis.srem(key, value);
  },

  // Ambil semua member set
  async getSetMembers(key: string): Promise<string[]> {
    return redis.smembers(key);
  },
};
