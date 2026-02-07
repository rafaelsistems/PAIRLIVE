import { FastifyInstance } from 'fastify';
import { FeedbackController } from '../controllers/feedback.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export default async function feedbackRoutes(fastify: FastifyInstance) {
  const controller = new FeedbackController();

  // All routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // Submit feedback
  fastify.post('/', controller.submitFeedback);
}
