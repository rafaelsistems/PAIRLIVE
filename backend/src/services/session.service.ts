import { prisma } from '../config/database';
import { redis, REDIS_KEYS, redisHelpers } from '../config/redis';
import { createLogger } from '../utils/logger';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('SessionService');

const AGORA_APP_ID = process.env.AGORA_APP_ID || '';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

interface ActiveSession {
  sessionId: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto: string | null;
  partnerLevel: number;
  agoraChannelId: string;
  startTime: Date;
  canSkip: boolean;
  skipCooldownEnds: Date | null;
}

export class SessionService {
  async createSession(user1Id: string, user2Id: string): Promise<string> {
    const sessionId = uuidv4();
    const channelId = `session_${sessionId}`;

    // Create session in database
    const session = await prisma.session.create({
      data: {
        id: sessionId,
        user1Id,
        user2Id,
        agoraChannelId: channelId,
        status: 'ACTIVE',
        startTime: new Date(),
      },
    });

    // Store active session in Redis
    const sessionData = {
      sessionId,
      user1Id,
      user2Id,
      channelId,
      startTime: Date.now(),
    };

    await redisHelpers.setJSON(
      REDIS_KEYS.ACTIVE_SESSION(sessionId),
      sessionData,
      3600 * 4 // 4 hour max session
    );

    // Mark both users as in session
    await Promise.all([
      redis.setex(REDIS_KEYS.USER_SESSION(user1Id), 3600 * 4, sessionId),
      redis.setex(REDIS_KEYS.USER_SESSION(user2Id), 3600 * 4, sessionId),
    ]);

    logger.info(`Session created: ${sessionId} between ${user1Id} and ${user2Id}`);

    return sessionId;
  }

  async getActiveSession(userId: string): Promise<ActiveSession | null> {
    const sessionId = await redis.get(REDIS_KEYS.USER_SESSION(userId));
    
    if (!sessionId) return null;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user1: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            level: true,
          },
        },
        user2: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            level: true,
          },
        },
      },
    });

    if (!session || session.status !== 'ACTIVE') return null;

    const partner = session.user1Id === userId ? session.user2 : session.user1;
    const skipCooldown = await this.getSkipCooldown(sessionId, userId);

    return {
      sessionId: session.id,
      partnerId: partner.id,
      partnerName: partner.displayName,
      partnerPhoto: partner.photoUrl,
      partnerLevel: partner.level,
      agoraChannelId: session.agoraChannelId,
      startTime: session.startTime,
      canSkip: !skipCooldown,
      skipCooldownEnds: skipCooldown,
    };
  }

  async skipSession(sessionId: string, userId: string): Promise<void> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw { code: 'NOT_FOUND' };
    }

    if (session.user1Id !== userId && session.user2Id !== userId) {
      throw { code: 'NOT_AUTHORIZED' };
    }

    // Check skip cooldown
    const cooldown = await this.getSkipCooldown(sessionId, userId);
    if (cooldown) {
      throw { code: 'SKIP_COOLDOWN' };
    }

    // End the session with skip status
    await this.endSessionInternal(sessionId, 'SKIPPED', userId);

    // Record skip behavior for trust score
    await prisma.userBehavior.create({
      data: {
        userId,
        sessionId,
        behaviorType: 'SKIP',
        metadata: { sessionDuration: Date.now() - session.startTime.getTime() },
        createdAt: new Date(),
      },
    });

    logger.info(`Session ${sessionId} skipped by ${userId}`);
  }

  async endSession(sessionId: string, userId: string): Promise<{ duration: number }> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw { code: 'NOT_FOUND' };
    }

    if (session.user1Id !== userId && session.user2Id !== userId) {
      throw { code: 'NOT_AUTHORIZED' };
    }

    const duration = await this.endSessionInternal(sessionId, 'COMPLETED', userId);

    return { duration };
  }

  private async endSessionInternal(
    sessionId: string,
    status: 'COMPLETED' | 'SKIPPED' | 'DISCONNECTED',
    endedBy?: string
  ): Promise<number> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return 0;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

    // Update session in database
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status,
        endTime,
        duration,
        endedBy,
      },
    });

    // Update user stats
    const durationMinutes = Math.floor(duration / 60);
    await Promise.all([
      prisma.user.update({
        where: { id: session.user1Id },
        data: {
          totalSessions: { increment: 1 },
          totalMinutes: { increment: durationMinutes },
        },
      }),
      prisma.user.update({
        where: { id: session.user2Id },
        data: {
          totalSessions: { increment: 1 },
          totalMinutes: { increment: durationMinutes },
        },
      }),
    ]);

    // Clean up Redis
    await Promise.all([
      redis.del(REDIS_KEYS.ACTIVE_SESSION(sessionId)),
      redis.del(REDIS_KEYS.USER_SESSION(session.user1Id)),
      redis.del(REDIS_KEYS.USER_SESSION(session.user2Id)),
    ]);

    logger.info(`Session ${sessionId} ended with status: ${status}, duration: ${duration}s`);

    return duration;
  }

  async getAgoraToken(sessionId: string, userId: string): Promise<string> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw { code: 'NOT_FOUND' };
    }

    if (session.user1Id !== userId && session.user2Id !== userId) {
      throw { code: 'NOT_AUTHORIZED' };
    }

    // Generate Agora token
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Use numeric UID for Agora
    const uid = session.user1Id === userId ? 1 : 2;

    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      session.agoraChannelId,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    return token;
  }

  async getHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
          status: { in: ['COMPLETED', 'SKIPPED'] },
        },
        include: {
          user1: {
            select: {
              id: true,
              displayName: true,
              photoUrl: true,
            },
          },
          user2: {
            select: {
              id: true,
              displayName: true,
              photoUrl: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.session.count({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
          status: { in: ['COMPLETED', 'SKIPPED'] },
        },
      }),
    ]);

    // Format sessions to show partner info
    const formattedSessions = sessions.map((session) => {
      const partner = session.user1Id === userId ? session.user2 : session.user1;
      return {
        id: session.id,
        partner: {
          id: partner.id,
          displayName: partner.displayName,
          photoUrl: partner.photoUrl,
        },
        status: session.status,
        duration: session.duration,
        startTime: session.startTime,
        endTime: session.endTime,
      };
    });

    return { sessions: formattedSessions, total };
  }

  async getSessionDetails(sessionId: string, userId: string) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            level: true,
          },
        },
        user2: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            level: true,
          },
        },
        gifts: {
          select: {
            id: true,
            senderId: true,
            receiverId: true,
            giftType: true,
            coinAmount: true,
            createdAt: true,
          },
        },
        feedbacks: {
          where: { reviewerId: userId },
          select: {
            rating: true,
            comment: true,
          },
        },
      },
    });

    return session;
  }

  private async getSkipCooldown(sessionId: string, userId: string): Promise<Date | null> {
    const key = `skip_cooldown:${sessionId}:${userId}`;
    const cooldownEnd = await redis.get(key);
    
    if (!cooldownEnd) return null;
    
    const endTime = new Date(parseInt(cooldownEnd));
    return endTime > new Date() ? endTime : null;
  }
}
