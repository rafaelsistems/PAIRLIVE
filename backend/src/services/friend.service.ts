import { prisma } from '../config/database';
import { redis, REDIS_KEYS } from '../config/redis';
import { createLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('FriendService');

export class FriendService {
  async getFriends(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [friendships, total] = await Promise.all([
      prisma.friendship.findMany({
        where: {
          OR: [{ userId1: userId }, { userId2: userId }],
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
        },
        skip,
        take: limit,
      }),
      prisma.friendship.count({
        where: {
          OR: [{ userId1: userId }, { userId2: userId }],
        },
      }),
    ]);

    // Format to return friend info (not current user)
    const friends = await Promise.all(
      friendships.map(async (f) => {
        const friend = f.userId1 === userId ? f.user2 : f.user1;
        const isOnline = await this.isOnline(friend.id);

        return {
          id: friend.id,
          displayName: friend.displayName,
          photoUrl: friend.photoUrl,
          level: friend.level,
          isOnline,
          friendshipId: f.id,
          since: f.createdAt,
        };
      })
    );

    return { friends, total };
  }

  async getRequests(userId: string) {
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      sender: r.sender,
      createdAt: r.createdAt,
    }));
  }

  async sendRequest(senderId: string, receiverId: string): Promise<void> {
    // Check not self
    if (senderId === receiverId) {
      throw { code: 'SELF_REQUEST' };
    }

    // Check receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw { code: 'NOT_FOUND' };
    }

    // Check not already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId1: senderId, userId2: receiverId },
          { userId1: receiverId, userId2: senderId },
        ],
      },
    });

    if (existingFriendship) {
      throw { code: 'ALREADY_FRIENDS' };
    }

    // Check no pending request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId, status: 'PENDING' },
          { senderId: receiverId, receiverId: senderId, status: 'PENDING' },
        ],
      },
    });

    if (existingRequest) {
      // If they sent us a request, auto-accept
      if (existingRequest.senderId === receiverId) {
        await this.acceptRequest(existingRequest.id, senderId);
        return;
      }
      throw { code: 'REQUEST_EXISTS' };
    }

    // Create request
    await prisma.friendRequest.create({
      data: {
        id: uuidv4(),
        senderId,
        receiverId,
        status: 'PENDING',
        createdAt: new Date(),
      },
    });

    logger.info(`Friend request sent: ${senderId} -> ${receiverId}`);
  }

  async acceptRequest(requestId: string, userId: string): Promise<void> {
    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== 'PENDING') {
      throw { code: 'NOT_FOUND' };
    }

    if (request.receiverId !== userId) {
      throw { code: 'NOT_AUTHORIZED' };
    }

    // Create friendship and update request in transaction
    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      }),
      prisma.friendship.create({
        data: {
          id: uuidv4(),
          userId1: request.senderId,
          userId2: request.receiverId,
          createdAt: new Date(),
        },
      }),
    ]);

    logger.info(`Friend request accepted: ${request.senderId} <-> ${request.receiverId}`);
  }

  async rejectRequest(requestId: string, userId: string): Promise<void> {
    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== 'PENDING') {
      throw { code: 'NOT_FOUND' };
    }

    // Allow either party to reject/cancel
    if (request.receiverId !== userId && request.senderId !== userId) {
      throw { code: 'NOT_AUTHORIZED' };
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    logger.info(`Friend request rejected: ${requestId}`);
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId1: userId, userId2: friendId },
          { userId1: friendId, userId2: userId },
        ],
      },
    });

    if (!friendship) {
      throw { code: 'NOT_FOUND' };
    }

    await prisma.friendship.delete({
      where: { id: friendship.id },
    });

    logger.info(`Friendship removed: ${userId} <-> ${friendId}`);
  }

  private async isOnline(userId: string): Promise<boolean> {
    const exists = await redis.exists(REDIS_KEYS.USER_ONLINE(userId));
    return exists === 1;
  }
}
