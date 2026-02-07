/**
 * Integration Tests untuk Health Check Endpoints
 * 
 * Menguji endpoint health check tanpa memerlukan
 * koneksi database/redis yang sebenarnya.
 */

import Fastify, { FastifyInstance } from 'fastify';

// Mock database dan redis sebelum import health module
jest.mock('../../src/config/database', () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

jest.mock('../../src/config/redis', () => ({
  redis: {
    ping: jest.fn().mockResolvedValue('PONG'),
    on: jest.fn(),
    quit: jest.fn(),
  },
  REDIS_KEYS: {},
}));

// Mock metrics
jest.mock('../../src/monitoring/metrics', () => ({
  metrics: {
    getSnapshot: jest.fn().mockReturnValue({
      counters: { 'http.requests.total': 100 },
      gauges: { 'system.memory.rss': 50000000 },
      histograms: {},
      uptime: 60000,
    }),
    increment: jest.fn(),
    gauge: jest.fn(),
    histogram: jest.fn(),
    collectSystemMetrics: jest.fn(),
  },
  METRIC_NAMES: {
    HTTP_REQUESTS_TOTAL: 'http.requests.total',
    HTTP_REQUESTS_DURATION: 'http.requests.duration',
    HTTP_REQUESTS_ERROR: 'http.requests.error',
  },
}));

import { registerHealthRoutes } from '../../src/monitoring/health';

describe('Health Check Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    registerHealthRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return 200 with basic health info', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health with component checks', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.checks.database.status).toBe('up');
      expect(body.checks.redis.status).toBe('up');
      expect(body.checks.memory.status).toBe('up');
      expect(body.version).toBe('1.0.0');
    });

    it('should return 503 when database is down', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'));

      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      });

      expect(response.statusCode).toBe(503);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('unhealthy');
      expect(body.checks.database.status).toBe('down');
    });

    it('should return 503 when redis is down', async () => {
      const { redis } = require('../../src/config/redis');
      redis.ping.mockRejectedValueOnce(new Error('Connection refused'));

      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      });

      expect(response.statusCode).toBe(503);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('unhealthy');
      expect(body.checks.redis.status).toBe('down');
    });
  });

  describe('GET /health/metrics', () => {
    it('should return metrics snapshot', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/metrics',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.counters).toBeDefined();
      expect(body.gauges).toBeDefined();
      expect(body.uptime).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 when all services are up', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/ready',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.ready).toBe(true);
    });
  });

  describe('GET /health/live', () => {
    it('should return 200 with alive status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/live',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.alive).toBe(true);
      expect(body.timestamp).toBeDefined();
    });
  });
});
