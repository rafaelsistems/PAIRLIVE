import { Server, Socket } from 'socket.io';
import { verifyAccessToken, TokenPayload } from '../services/token.service';
import { redis, REDIS_KEYS } from '../config/redis';
import { createLogger } from '../utils/logger';
import { MatchingHandler } from './matching.handler';
import { SessionHandler } from './session.handler';

const logger = createLogger('Socket.IO');

// Extend Socket interface
declare module 'socket.io' {
  interface Socket {
    user: TokenPayload;
  }
}

export function setupSocketIO(io: Server): void {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        return next(new Error('Invalid token'));
      }

      socket.user = payload;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', async (socket) => {
    const userId = socket.user.userId;
    logger.info(`User connected: ${userId}`);

    // Mark user as online
    await redis.setex(REDIS_KEYS.USER_ONLINE(userId), 300, socket.id);
    await redis.set(REDIS_KEYS.USER_SOCKET(userId), socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Initialize handlers
    const matchingHandler = new MatchingHandler(io, socket);
    const sessionHandler = new SessionHandler(io, socket);

    // Matching events
    socket.on('matching:join', matchingHandler.handleJoin);
    socket.on('matching:leave', matchingHandler.handleLeave);

    // Session events
    socket.on('session:ready', sessionHandler.handleReady);
    socket.on('session:message', sessionHandler.handleMessage);
    socket.on('session:typing', sessionHandler.handleTyping);
    socket.on('session:gift', sessionHandler.handleGift);
    socket.on('session:skip', sessionHandler.handleSkip);
    socket.on('session:end', sessionHandler.handleEnd);

    // Heartbeat to keep online status
    const heartbeatInterval = setInterval(async () => {
      await redis.setex(REDIS_KEYS.USER_ONLINE(userId), 300, socket.id);
    }, 60000);

    // Disconnect handler
    socket.on('disconnect', async (reason) => {
      logger.info(`User disconnected: ${userId}, reason: ${reason}`);

      clearInterval(heartbeatInterval);

      // Remove online status
      await redis.del(REDIS_KEYS.USER_ONLINE(userId));
      await redis.del(REDIS_KEYS.USER_SOCKET(userId));

      // Handle if user was in matching queue
      await matchingHandler.handleDisconnect();

      // Handle if user was in active session
      await sessionHandler.handleDisconnect();
    });
  });

  logger.info('Socket.IO initialized');
}
