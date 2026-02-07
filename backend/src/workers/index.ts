import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { createLogger } from '../utils/logger';
import { TrustScoreService } from '../services/trust-score.service';

const logger = createLogger('Workers');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

// ====================================
// TRUST SCORE QUEUE
// ====================================

export const trustScoreQueue = new Queue('trust-score', { connection });

const trustScoreService = new TrustScoreService();

const trustScoreWorker = new Worker(
  'trust-score',
  async (job: Job) => {
    const { userId, behaviorType, metadata } = job.data;

    logger.info(`Processing trust score update for user ${userId}, behavior: ${behaviorType}`);

    await trustScoreService.updateFromBehavior(userId, behaviorType);

    return { success: true };
  },
  { connection }
);

trustScoreWorker.on('completed', (job) => {
  logger.debug(`Trust score job ${job.id} completed`);
});

trustScoreWorker.on('failed', (job, err) => {
  logger.error(`Trust score job ${job?.id} failed:`, err);
});

// ====================================
// SCHEDULED JOBS
// ====================================

export const scheduledQueue = new Queue('scheduled', { connection });

const scheduledWorker = new Worker(
  'scheduled',
  async (job: Job) => {
    switch (job.name) {
      case 'trust-recovery':
        logger.info('Running trust score recovery');
        await trustScoreService.processRecovery();
        break;

      case 'cleanup-sessions':
        logger.info('Running session cleanup');
        // TODO: Clean up stale sessions
        break;

      default:
        logger.warn(`Unknown scheduled job: ${job.name}`);
    }

    return { success: true };
  },
  { connection }
);

scheduledWorker.on('completed', (job) => {
  logger.debug(`Scheduled job ${job.id} completed`);
});

scheduledWorker.on('failed', (job, err) => {
  logger.error(`Scheduled job ${job?.id} failed:`, err);
});

// Schedule recurring jobs
export async function setupScheduledJobs(): Promise<void> {
  // Trust score recovery - run daily at 3 AM
  await scheduledQueue.add(
    'trust-recovery',
    {},
    {
      repeat: {
        pattern: '0 3 * * *', // Cron: every day at 3 AM
      },
    }
  );

  // Session cleanup - run every hour
  await scheduledQueue.add(
    'cleanup-sessions',
    {},
    {
      repeat: {
        pattern: '0 * * * *', // Cron: every hour
      },
    }
  );

  logger.info('Scheduled jobs configured');
}

// ====================================
// WORKER INITIALIZATION
// ====================================

export async function startWorkers(): Promise<void> {
  logger.info('Starting background workers');

  await setupScheduledJobs();

  logger.info('All workers started');
}

export async function stopWorkers(): Promise<void> {
  logger.info('Stopping background workers');

  await Promise.all([
    trustScoreWorker.close(),
    scheduledWorker.close(),
  ]);

  await Promise.all([
    trustScoreQueue.close(),
    scheduledQueue.close(),
  ]);

  logger.info('All workers stopped');
}
