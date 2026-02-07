/**
 * Health Check System
 * 
 * Endpoint untuk monitoring status kesehatan aplikasi:
 * - Database connectivity
 * - Redis connectivity
 * - Memory usage
 * - Disk space (basic)
 * - Application uptime
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { metrics } from './metrics';
import { createLogger } from '../utils/logger';

const logger = createLogger('HealthCheck');

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: ComponentHealth;
    redis: ComponentHealth;
    memory: ComponentHealth;
  };
  metrics?: ReturnType<typeof metrics.getSnapshot>;
}

interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'up',
      latency: Date.now() - start,
    };
  } catch (error: any) {
    logger.error('Database health check failed:', error);
    return {
      status: 'down',
      latency: Date.now() - start,
      message: error.message,
    };
  }
}

async function checkRedis(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    const pong = await redis.ping();
    return {
      status: pong === 'PONG' ? 'up' : 'degraded',
      latency: Date.now() - start,
    };
  } catch (error: any) {
    logger.error('Redis health check failed:', error);
    return {
      status: 'down',
      latency: Date.now() - start,
      message: error.message,
    };
  }
}

function checkMemory(): ComponentHealth {
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
  const usagePercent = (heapUsedMB / heapTotalMB) * 100;

  if (usagePercent > 90) {
    return {
      status: 'degraded',
      message: `Heap usage: ${usagePercent.toFixed(1)}% (${heapUsedMB.toFixed(1)}MB / ${heapTotalMB.toFixed(1)}MB)`,
    };
  }

  return {
    status: 'up',
    message: `Heap usage: ${usagePercent.toFixed(1)}% (${heapUsedMB.toFixed(1)}MB / ${heapTotalMB.toFixed(1)}MB)`,
  };
}

/**
 * Register health check routes
 */
export function registerHealthRoutes(fastify: FastifyInstance): void {
  // Basic health check (untuk load balancer)
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Detailed health check (untuk monitoring)
  fastify.get('/health/detailed', async (request, reply) => {
    const [database, redisHealth] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);
    const memory = checkMemory();

    const allUp = database.status === 'up' && redisHealth.status === 'up';
    const anyDown = database.status === 'down' || redisHealth.status === 'down';

    const health: HealthStatus = {
      status: anyDown ? 'unhealthy' : allUp ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      checks: {
        database,
        redis: redisHealth,
        memory,
      },
    };

    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    return reply.status(statusCode).send(health);
  });

  // Metrics endpoint
  fastify.get('/health/metrics', async () => {
    return metrics.getSnapshot();
  });

  // Readiness probe (untuk Kubernetes/deployment)
  fastify.get('/health/ready', async (request, reply) => {
    const [database, redisHealth] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);

    const ready = database.status === 'up' && redisHealth.status === 'up';

    return reply.status(ready ? 200 : 503).send({
      ready,
      checks: { database: database.status, redis: redisHealth.status },
    });
  });

  // Liveness probe
  fastify.get('/health/live', async () => {
    return { alive: true, timestamp: new Date().toISOString() };
  });
}
