import { prisma } from '../config/database';
import { redis, REDIS_KEYS } from '../config/redis';
import { createLogger } from '../utils/logger';

const logger = createLogger('UserService');

interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  interests?: string[];
}

export class UserService {
  async getProfile(userId: string) {
    // Try cache first
    const cacheKey = REDIS_KEYS.USER_PROFILE(userId);
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        bio: true,
        interests: true,
        gender: true,
        birthDate: true,
        trustCategory: true,
        level: true,
        coinBalance: true,
        totalSessions: true,
        totalMinutes: true,
        averageRating: true,
        createdAt: true,
      },
    });

    if (user) {
      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(user));
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        bio: true,
        interests: true,
      },
    });

    // Invalidate cache
    await redis.del(REDIS_KEYS.USER_PROFILE(userId));

    logger.info(`Profile updated for: ${userId}`);

    return user;
  }

  async updatePhoto(userId: string, photoUrl: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        photoUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        photoUrl: true,
      },
    });

    // Invalidate cache
    await redis.del(REDIS_KEYS.USER_PROFILE(userId));

    return user;
  }

  async deleteAccount(userId: string) {
    // Soft delete - mark as deleted
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted_${userId}@deleted.local`,
      },
    });

    // Invalidate cache
    await redis.del(REDIS_KEYS.USER_PROFILE(userId));

    logger.info(`Account deleted: ${userId}`);
  }

  async getStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalSessions: true,
        totalMinutes: true,
        averageRating: true,
        level: true,
        coinBalance: true,
        totalCoinsEarned: true,
        totalCoinsSpent: true,
      },
    });

    // Get additional stats
    const [friendsCount, sessionsThisWeek] = await Promise.all([
      prisma.friendship.count({
        where: {
          OR: [{ userId1: userId }, { userId2: userId }],
        },
      }),
      prisma.session.count({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
          startTime: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      ...user,
      friendsCount,
      sessionsThisWeek,
    };
  }

  async getPublicProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        photoUrl: true,
        bio: true,
        interests: true,
        level: true,
        trustCategory: true,
        totalSessions: true,
        averageRating: true,
        createdAt: true,
      },
    });
  }
}
