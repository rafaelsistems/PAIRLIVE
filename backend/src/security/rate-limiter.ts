/**
 * Advanced Rate Limiter
 * 
 * Rate limiting berbasis Redis untuk proteksi endpoint sensitif.
 * Mendukung sliding window dan per-endpoint limits.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../config/redis';
import { createLogger } from '../utils/logger';
import { errors } from '../utils/response';

const logger = createLogger('RateLimiter');

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  message?: string;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Auth endpoints - ketat
  'auth:login': {
    windowMs: 15 * 60 * 1000, // 15 menit
    maxRequests: 5,
    keyPrefix: 'rl:auth:login',
    message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
  },
  'auth:register': {
    windowMs: 60 * 60 * 1000, // 1 jam
    maxRequests: 3,
    keyPrefix: 'rl:auth:register',
    message: 'Terlalu banyak percobaan registrasi. Coba lagi nanti.',
  },
  'auth:forgot-password': {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    keyPrefix: 'rl:auth:forgot',
    message: 'Terlalu banyak permintaan reset password.',
  },

  // API endpoints - moderat
  'api:general': {
    windowMs: 60 * 1000, // 1 menit
    maxRequests: 100,
    keyPrefix: 'rl:api',
    message: 'Terlalu banyak request. Coba lagi nanti.',
  },
  'api:matching': {
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'rl:matching',
    message: 'Terlalu banyak permintaan matching.',
  },
  'api:gift': {
    windowMs: 60 * 1000,
    maxRequests: 30,
    keyPrefix: 'rl:gift',
    message: 'Terlalu banyak pengiriman hadiah.',
  },
  'api:report': {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'rl:report',
    message: 'Terlalu banyak laporan. Coba lagi nanti.',
  },
};

/**
 * Check rate limit menggunakan Redis sliding window
 */
async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const pipeline = redis.pipeline();

  // Hapus entries yang sudah expired
  pipeline.zremrangebyscore(key, 0, windowStart);
  // Hitung jumlah request dalam window
  pipeline.zcard(key);
  // Tambah request baru
  pipeline.zadd(key, now.toString(), `${now}:${Math.random()}`);
  // Set TTL
  pipeline.pexpire(key, config.windowMs);

  const results = await pipeline.exec();
  const currentCount = (results?.[1]?.[1] as number) || 0;

  const allowed = currentCount < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - currentCount - 1);
  const resetAt = now + config.windowMs;

  if (!allowed) {
    // Hapus request yang baru ditambahkan karena ditolak
    await redis.zremrangebyscore(key, now.toString(), now.toString());
  }

  return { allowed, remaining, resetAt };
}

/**
 * Factory untuk membuat rate limit middleware
 */
export function createRateLimiter(configKey: string) {
  const config = RATE_LIMIT_CONFIGS[configKey];
  if (!config) {
    logger.warn(`Rate limit config not found: ${configKey}, using default`);
  }
  const effectiveConfig = config || RATE_LIMIT_CONFIGS['api:general'];

  return async function rateLimitMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Gunakan IP + userId (jika ada) sebagai identifier
    const ip = request.ip;
    const userId = (request as any).user?.userId;
    const identifier = userId || ip;

    try {
      const result = await checkRateLimit(identifier, effectiveConfig);

      // Set rate limit headers
      reply.header('X-RateLimit-Limit', effectiveConfig.maxRequests);
      reply.header('X-RateLimit-Remaining', result.remaining);
      reply.header('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

      if (!result.allowed) {
        reply.header('Retry-After', Math.ceil(effectiveConfig.windowMs / 1000));
        return errors.tooManyRequests(
          reply,
          effectiveConfig.message || 'Terlalu banyak request'
        );
      }
    } catch (error) {
      // Jika Redis error, izinkan request (fail-open)
      logger.error('Rate limiter error:', error);
    }
  };
}

export { RATE_LIMIT_CONFIGS };
