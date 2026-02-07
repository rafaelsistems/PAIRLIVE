import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export default async function userRoutes(fastify: FastifyInstance) {
  const controller = new UserController();

  // All routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // Profile routes
  fastify.get('/me', controller.getProfile);
  fastify.put('/me', controller.updateProfile);
  fastify.put('/me/photo', controller.updatePhoto);
  fastify.delete('/me', controller.deleteAccount);

  // Stats
  fastify.get('/me/stats', controller.getStats);

  // View other user's public profile
  fastify.get('/:userId', controller.getPublicProfile);
}
