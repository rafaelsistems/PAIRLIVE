import { FastifyInstance } from 'fastify';
import { MatchingController } from '../controllers/matching.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export default async function matchingRoutes(fastify: FastifyInstance) {
  const controller = new MatchingController();

  // All routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // Queue operations
  fastify.post('/join', controller.joinQueue);
  fastify.delete('/leave', controller.leaveQueue);
  fastify.get('/status', controller.getQueueStatus);
}
