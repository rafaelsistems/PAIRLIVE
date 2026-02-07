import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export default async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController();

  // Public routes
  fastify.post('/register', controller.register);
  fastify.post('/login', controller.login);
  fastify.post('/refresh-token', controller.refreshToken);
  fastify.post('/forgot-password', controller.forgotPassword);
  fastify.post('/reset-password', controller.resetPassword);

  // Protected routes
  fastify.post('/logout', { preHandler: [authMiddleware] }, controller.logout);
  fastify.post('/change-password', { preHandler: [authMiddleware] }, controller.changePassword);
}
