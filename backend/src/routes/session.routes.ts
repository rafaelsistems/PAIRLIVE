import { FastifyInstance } from 'fastify';
import { SessionController } from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export default async function sessionRoutes(fastify: FastifyInstance) {
  const controller = new SessionController();

  // All routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // Session operations
  fastify.get('/active', controller.getActiveSession);
  fastify.post('/:sessionId/skip', controller.skipSession);
  fastify.post('/:sessionId/end', controller.endSession);
  fastify.get('/:sessionId/agora-token', controller.getAgoraToken);

  // History
  fastify.get('/history', controller.getHistory);
  fastify.get('/:sessionId', controller.getSessionDetails);
}
