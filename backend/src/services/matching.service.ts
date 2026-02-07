import { prisma } from '../config/database';
import { redis, REDIS_KEYS, redisHelpers } from '../config/redis';
import { createLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('MatchingService');

interface QueueEntry {
  userId: string;
  joinedAt: number;
  trustScore: number;
  trustCategory: string;
  gender: string;
  priority: number;
}

interface QueueStatus {
  inQueue: boolean;
  position?: number;
  estimatedWait?: number;
}

export class MatchingService {
  private readonly QUEUE_KEY = REDIS_KEYS.MATCHING_QUEUE;
  
  async joinQueue(userId: string): Promise<{ queueId: string; position: number }> {
    // Check if already in queue
    const existingEntry = await redis.get(REDIS_KEYS.MATCHING_USER(userId));
    if (existingEntry) {
      throw { code: 'ALREADY_IN_QUEUE' };
    }

    // Check if in active session
    const activeSession = await redis.get(REDIS_KEYS.USER_SESSION(userId));
    if (activeSession) {
      throw { code: 'IN_SESSION' };
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        trustScore: true,
        trustCategory: true,
        gender: true,
        isPremium: true,
      },
    });

    if (!user) {
      throw { code: 'NOT_FOUND' };
    }

    // Check if restricted
    if (user.trustCategory === 'RESTRICTED' || user.trustCategory === 'SUSPENDED') {
      throw { code: 'RESTRICTED' };
    }

    // Calculate priority (premium users get +10)
    const priority = user.isPremium ? 10 : 0;

    // Create queue entry
    const queueEntry: QueueEntry = {
      userId,
      joinedAt: Date.now(),
      trustScore: user.trustScore,
      trustCategory: user.trustCategory,
      gender: user.gender,
      priority,
    };

    // Add to sorted set with score based on priority and join time
    const score = Date.now() - priority * 60000; // Priority reduces effective wait time
    await redis.zadd(this.QUEUE_KEY, score, JSON.stringify(queueEntry));

    // Mark user as in queue
    await redisHelpers.setJSON(
      REDIS_KEYS.MATCHING_USER(userId),
      queueEntry,
      300 // 5 minute expiry
    );

    // Get position
    const position = await this.getPosition(userId);

    logger.info(`User joined queue: ${userId}, position: ${position}`);

    return {
      queueId: uuidv4(),
      position,
    };
  }

  async leaveQueue(userId: string): Promise<void> {
    // Get user entry
    const entry = await redisHelpers.getJSON<QueueEntry>(REDIS_KEYS.MATCHING_USER(userId));

    if (entry) {
      // Remove from sorted set
      await redis.zrem(this.QUEUE_KEY, JSON.stringify(entry));
    }

    // Remove user marker
    await redis.del(REDIS_KEYS.MATCHING_USER(userId));

    logger.info(`User left queue: ${userId}`);
  }

  async getQueueStatus(userId: string): Promise<QueueStatus> {
    const entry = await redisHelpers.getJSON<QueueEntry>(REDIS_KEYS.MATCHING_USER(userId));

    if (!entry) {
      return { inQueue: false };
    }

    const position = await this.getPosition(userId);
    const queueSize = await redis.zcard(this.QUEUE_KEY);

    // Estimate wait time (rough: 15 seconds per person ahead)
    const estimatedWait = Math.max(10, position * 15);

    return {
      inQueue: true,
      position,
      estimatedWait,
    };
  }

  private async getPosition(userId: string): Promise<number> {
    const entry = await redisHelpers.getJSON<QueueEntry>(REDIS_KEYS.MATCHING_USER(userId));
    
    if (!entry) return 0;

    const rank = await redis.zrank(this.QUEUE_KEY, JSON.stringify(entry));
    return rank !== null ? rank + 1 : 0;
  }

  // This method is called by the MatchingWorker
  async findMatch(userId: string): Promise<string | null> {
    const userEntry = await redisHelpers.getJSON<QueueEntry>(REDIS_KEYS.MATCHING_USER(userId));
    
    if (!userEntry) return null;

    // Get all queue entries
    const entries = await redis.zrange(this.QUEUE_KEY, 0, -1);
    
    for (const entryStr of entries) {
      const entry: QueueEntry = JSON.parse(entryStr);
      
      // Skip self
      if (entry.userId === userId) continue;

      // Check compatibility
      if (this.isCompatible(userEntry, entry)) {
        return entry.userId;
      }
    }

    return null;
  }

  private isCompatible(user1: QueueEntry, user2: QueueEntry): boolean {
    // Trust score difference should be within 30 points
    const trustDiff = Math.abs(user1.trustScore - user2.trustScore);
    if (trustDiff > 30) return false;

    // Both users should have similar trust categories
    // Premium users can match with anyone in GOOD category or above
    const goodCategories = ['PREMIUM', 'GOOD'];
    const user1Good = goodCategories.includes(user1.trustCategory);
    const user2Good = goodCategories.includes(user2.trustCategory);

    // Both should be in good standing for best experience
    if (user1Good && user2Good) return true;

    // WARNING users can only match with other WARNING users
    if (user1.trustCategory === 'WARNING' && user2.trustCategory === 'WARNING') return true;

    return false;
  }
}
