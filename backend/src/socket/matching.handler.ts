import { Server, Socket } from 'socket.io';
import { MatchingService } from '../services/matching.service';
import { SessionService } from '../services/session.service';
import { redis, REDIS_KEYS, redisHelpers } from '../config/redis';
import { createLogger } from '../utils/logger';

const logger = createLogger('MatchingHandler');
const matchingService = new MatchingService();
const sessionService = new SessionService();

export class MatchingHandler {
  private io: Server;
  private socket: Socket;
  private userId: string;
  private matchingInterval: NodeJS.Timeout | null = null;

  constructor(io: Server, socket: Socket) {
    this.io = io;
    this.socket = socket;
    this.userId = socket.user.userId;

    // Bind methods
    this.handleJoin = this.handleJoin.bind(this);
    this.handleLeave = this.handleLeave.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  async handleJoin(): Promise<void> {
    try {
      // Join queue via service
      const result = await matchingService.joinQueue(this.userId);

      // Emit queue status
      this.socket.emit('matching:joined', {
        queueId: result.queueId,
        position: result.position,
      });

      // Start matching process
      this.startMatching();

      logger.info(`User ${this.userId} joined matching queue`);
    } catch (error: any) {
      this.socket.emit('matching:error', {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to join queue',
      });
    }
  }

  async handleLeave(): Promise<void> {
    try {
      this.stopMatching();
      await matchingService.leaveQueue(this.userId);

      this.socket.emit('matching:left');

      logger.info(`User ${this.userId} left matching queue`);
    } catch (error) {
      this.socket.emit('matching:error', {
        code: 'LEAVE_FAILED',
        message: 'Failed to leave queue',
      });
    }
  }

  async handleDisconnect(): Promise<void> {
    this.stopMatching();
    try {
      await matchingService.leaveQueue(this.userId);
    } catch (error) {
      // Ignore errors on disconnect
    }
  }

  private startMatching(): void {
    // Check for matches every 2 seconds
    this.matchingInterval = setInterval(async () => {
      await this.checkForMatch();
    }, 2000);
  }

  private stopMatching(): void {
    if (this.matchingInterval) {
      clearInterval(this.matchingInterval);
      this.matchingInterval = null;
    }
  }

  private async checkForMatch(): Promise<void> {
    try {
      // Check if still in queue
      const inQueue = await redis.get(REDIS_KEYS.MATCHING_USER(this.userId));
      if (!inQueue) {
        this.stopMatching();
        return;
      }

      // Try to find a match
      const matchedUserId = await matchingService.findMatch(this.userId);

      if (matchedUserId) {
        await this.createMatch(matchedUserId);
      } else {
        // Update queue position
        const status = await matchingService.getQueueStatus(this.userId);
        this.socket.emit('matching:update', {
          position: status.position,
          estimatedWait: status.estimatedWait,
        });
      }
    } catch (error) {
      logger.error('Error checking for match:', error);
    }
  }

  private async createMatch(matchedUserId: string): Promise<void> {
    this.stopMatching();

    try {
      // Remove both users from queue
      await Promise.all([
        matchingService.leaveQueue(this.userId),
        matchingService.leaveQueue(matchedUserId),
      ]);

      // Create session
      const sessionId = await sessionService.createSession(this.userId, matchedUserId);

      // Get partner socket
      const partnerSocketId = await redis.get(REDIS_KEYS.USER_SOCKET(matchedUserId));

      // Get session details for both users
      const session = await sessionService.getActiveSession(this.userId);
      const partnerSession = await sessionService.getActiveSession(matchedUserId);

      // Emit match found to both users
      this.socket.emit('matching:found', {
        sessionId,
        partner: {
          id: session?.partnerId,
          displayName: session?.partnerName,
          photoUrl: session?.partnerPhoto,
          level: session?.partnerLevel,
        },
        agoraChannelId: session?.agoraChannelId,
      });

      if (partnerSocketId) {
        this.io.to(partnerSocketId).emit('matching:found', {
          sessionId,
          partner: {
            id: partnerSession?.partnerId,
            displayName: partnerSession?.partnerName,
            photoUrl: partnerSession?.partnerPhoto,
            level: partnerSession?.partnerLevel,
          },
          agoraChannelId: partnerSession?.agoraChannelId,
        });
      }

      // Join both to session room
      this.socket.join(`session:${sessionId}`);
      if (partnerSocketId) {
        const partnerSocket = this.io.sockets.sockets.get(partnerSocketId);
        partnerSocket?.join(`session:${sessionId}`);
      }

      logger.info(`Match created: ${this.userId} <-> ${matchedUserId}, session: ${sessionId}`);
    } catch (error) {
      logger.error('Error creating match:', error);

      // Re-queue users on error
      this.socket.emit('matching:error', {
        code: 'MATCH_FAILED',
        message: 'Failed to create match, please try again',
      });
    }
  }
}
