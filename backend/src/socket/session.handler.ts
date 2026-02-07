import { Server, Socket } from 'socket.io';
import { SessionService } from '../services/session.service';
import { CoinService } from '../services/coin.service';
import { redis, REDIS_KEYS } from '../config/redis';
import { createLogger } from '../utils/logger';

const logger = createLogger('SessionHandler');
const sessionService = new SessionService();
const coinService = new CoinService();

interface ChatMessage {
  sessionId: string;
  content: string;
}

interface GiftData {
  sessionId: string;
  giftType: string;
  coinAmount: number;
}

export class SessionHandler {
  private io: Server;
  private socket: Socket;
  private userId: string;

  constructor(io: Server, socket: Socket) {
    this.io = io;
    this.socket = socket;
    this.userId = socket.user.userId;

    // Bind methods
    this.handleReady = this.handleReady.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleTyping = this.handleTyping.bind(this);
    this.handleGift = this.handleGift.bind(this);
    this.handleSkip = this.handleSkip.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  async handleReady(data: { sessionId: string }): Promise<void> {
    try {
      const { sessionId } = data;

      // Notify room that user is ready
      this.socket.to(`session:${sessionId}`).emit('session:partner-ready', {
        userId: this.userId,
      });

      logger.info(`User ${this.userId} ready in session ${sessionId}`);
    } catch (error) {
      logger.error('Error handling ready:', error);
    }
  }

  async handleMessage(data: ChatMessage): Promise<void> {
    try {
      const { sessionId, content } = data;

      // Verify user is in session
      const activeSession = await sessionService.getActiveSession(this.userId);
      if (!activeSession || activeSession.sessionId !== sessionId) {
        return;
      }

      // Broadcast message to session room
      this.io.to(`session:${sessionId}`).emit('session:message', {
        senderId: this.userId,
        content,
        timestamp: new Date().toISOString(),
      });

      logger.debug(`Message in session ${sessionId} from ${this.userId}`);
    } catch (error) {
      logger.error('Error handling message:', error);
    }
  }

  async handleTyping(data: { sessionId: string; isTyping: boolean }): Promise<void> {
    try {
      const { sessionId, isTyping } = data;

      // Broadcast typing status to partner
      this.socket.to(`session:${sessionId}`).emit('session:typing', {
        userId: this.userId,
        isTyping,
      });
    } catch (error) {
      logger.error('Error handling typing:', error);
    }
  }

  async handleGift(data: GiftData): Promise<void> {
    try {
      const { sessionId, giftType, coinAmount } = data;

      // Verify user is in session
      const activeSession = await sessionService.getActiveSession(this.userId);
      if (!activeSession || activeSession.sessionId !== sessionId) {
        this.socket.emit('session:gift-error', {
          code: 'INVALID_SESSION',
          message: 'Not in active session',
        });
        return;
      }

      // Send gift
      const result = await coinService.sendGift({
        senderId: this.userId,
        sessionId,
        receiverId: activeSession.partnerId,
        giftType,
        coinAmount,
      });

      // Notify both users
      this.io.to(`session:${sessionId}`).emit('session:gift-sent', {
        senderId: this.userId,
        receiverId: activeSession.partnerId,
        giftType,
        coinAmount,
        timestamp: new Date().toISOString(),
      });

      // Update sender's balance
      this.socket.emit('session:balance-updated', {
        newBalance: result.newBalance,
      });

      logger.info(`Gift sent in session ${sessionId}: ${giftType} from ${this.userId}`);
    } catch (error: any) {
      this.socket.emit('session:gift-error', {
        code: error.code || 'GIFT_FAILED',
        message: error.message || 'Failed to send gift',
      });
    }
  }

  async handleSkip(data: { sessionId: string }): Promise<void> {
    try {
      const { sessionId } = data;

      await sessionService.skipSession(sessionId, this.userId);

      // Notify both users
      this.io.to(`session:${sessionId}`).emit('session:skipped', {
        skippedBy: this.userId,
      });

      // Remove from session room
      this.socket.leave(`session:${sessionId}`);

      logger.info(`Session ${sessionId} skipped by ${this.userId}`);
    } catch (error: any) {
      this.socket.emit('session:error', {
        code: error.code || 'SKIP_FAILED',
        message: error.message || 'Failed to skip session',
      });
    }
  }

  async handleEnd(data: { sessionId: string }): Promise<void> {
    try {
      const { sessionId } = data;

      const result = await sessionService.endSession(sessionId, this.userId);

      // Notify both users
      this.io.to(`session:${sessionId}`).emit('session:ended', {
        endedBy: this.userId,
        duration: result.duration,
      });

      // Remove from session room
      this.socket.leave(`session:${sessionId}`);

      logger.info(`Session ${sessionId} ended by ${this.userId}`);
    } catch (error: any) {
      this.socket.emit('session:error', {
        code: error.code || 'END_FAILED',
        message: error.message || 'Failed to end session',
      });
    }
  }

  async handleDisconnect(): Promise<void> {
    try {
      // Check if user was in active session
      const sessionId = await redis.get(REDIS_KEYS.USER_SESSION(this.userId));

      if (sessionId) {
        // Get session to find partner
        const activeSession = await sessionService.getActiveSession(this.userId);

        // End session due to disconnect
        // Note: Could implement reconnection grace period here
        await sessionService.endSession(sessionId, this.userId);

        // Notify partner
        if (activeSession) {
          const partnerSocketId = await redis.get(REDIS_KEYS.USER_SOCKET(activeSession.partnerId));
          if (partnerSocketId) {
            this.io.to(partnerSocketId).emit('session:partner-disconnected', {
              sessionId,
              partnerId: this.userId,
            });
          }
        }

        logger.info(`User ${this.userId} disconnected from session ${sessionId}`);
      }
    } catch (error) {
      logger.error('Error handling session disconnect:', error);
    }
  }
}
