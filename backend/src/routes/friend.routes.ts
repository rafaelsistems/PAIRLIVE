import { FastifyInstance } from 'fastify';
import { FriendController } from '../controllers/friend.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export default async function friendRoutes(fastify: FastifyInstance) {
  const controller = new FriendController();

  // All routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // Get friends list
  fastify.get('/', controller.getFriends);

  // Friend requests
  fastify.get('/requests', controller.getRequests);
  fastify.post('/request', controller.sendRequest);
  fastify.post('/requests/:requestId/accept', controller.acceptRequest);
  fastify.delete('/requests/:requestId', controller.rejectRequest);

  // Remove friend
  fastify.delete('/:friendId', controller.removeFriend);
}
