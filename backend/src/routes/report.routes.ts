import { FastifyInstance } from 'fastify';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export default async function reportRoutes(fastify: FastifyInstance) {
  const controller = new ReportController();

  // All routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // Submit report
  fastify.post('/', controller.submitReport);
}
