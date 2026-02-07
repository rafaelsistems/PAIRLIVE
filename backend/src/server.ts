import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { config } from './config';
import { registerRoutes } from './routes';
import { setupSocketIO } from './socket';
import { startWorkers, stopWorkers } from './workers';
import { validateSecrets } from './security/secrets';
import { registerHealthRoutes, registerRequestTracker, alerting } from './monitoring';
import { featureFlags } from './beta/feature-flags';

// Muat environment variables
dotenv.config();

// Validasi konfigurasi dan secrets
validateSecrets();

// Buat instance Fastify
const fastify = Fastify({
  logger: {
    level: config.server.isDev ? 'debug' : 'info',
    transport:
      config.server.isDev
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
              colorize: true,
            },
          }
        : undefined,
  },
});

// Daftarkan plugin
async function registerPlugins() {
  // CORS - Cross-Origin Resource Sharing
  await fastify.register(cors, {
    origin: config.cors.origin,
    credentials: true,
  });

  // Header keamanan
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  // JWT untuk autentikasi
  await fastify.register(jwt, {
    secret: config.jwt.secret,
  });

  // Rate limiting untuk mencegah spam
  await fastify.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.window,
  });
}

// Health check & monitoring routes
registerHealthRoutes(fastify);

// Request tracking middleware
registerRequestTracker(fastify);

// Route info API
fastify.get('/', async () => {
  return {
    nama: 'PAIRLIVE API',
    versi: '1.0.0',
    deskripsi: 'Satu Acak. Satu Live. Satu Koneksi.',
    dokumentasi: '/docs',
  };
});

// Handler error global
fastify.setErrorHandler((error, request, reply) => {
  logger.error('Error tidak tertangani:', error);

  reply.status(error.statusCode || 500).send({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message:
        config.server.isProd
          ? 'Terjadi kesalahan server'
          : error.message,
    },
  });
});

// Mulai server
async function start() {
  try {
    // Daftarkan plugin
    await registerPlugins();

    // Daftarkan routes
    await registerRoutes(fastify);

    // Koneksi ke database
    await prisma.$connect();
    logger.info('Terhubung ke database PostgreSQL');

    // Koneksi ke Redis
    await redis.ping();
    logger.info('Terhubung ke Redis');

    // Buat server Socket.IO
    const io = new Server(fastify.server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingInterval: 25000,
      pingTimeout: 60000,
    });

    // Setup handler Socket.IO
    setupSocketIO(io);

    // Mulai background workers
    await startWorkers();
    logger.info('Background workers dimulai');

    // Initialize feature flags
    await featureFlags.initialize();
    logger.info('Feature flags initialized');

    // Start alerting system
    alerting.start(30000); // Check every 30 seconds
    logger.info('Alerting system started');

    // Mulai listening
    await fastify.listen({ port: config.server.port, host: config.server.host });

    logger.info(`🚀 PAIRLIVE API berjalan di http://${config.server.host}:${config.server.port}`);
    logger.info(`📡 Server WebSocket siap`);
    logger.info(`🌍 Environment: ${config.server.env}`);
  } catch (error) {
    logger.error('Gagal memulai server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Mematikan server dengan aman...');

  try {
    alerting.stop();
    await stopWorkers();
    await fastify.close();
    await prisma.$disconnect();
    await redis.quit();

    logger.info('Server berhasil dimatikan');
    process.exit(0);
  } catch (error) {
    logger.error('Error saat shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Mulai server
start();
