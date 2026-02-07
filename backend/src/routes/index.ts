import { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import matchingRoutes from './matching.routes';
import sessionRoutes from './session.routes';
import feedbackRoutes from './feedback.routes';
import coinRoutes from './coin.routes';
import friendRoutes from './friend.routes';
import reportRoutes from './report.routes';
import betaRoutes from './beta.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  // API v1 routes
  fastify.register(async (api) => {
    api.register(authRoutes, { prefix: '/auth' });
    api.register(userRoutes, { prefix: '/users' });
    api.register(matchingRoutes, { prefix: '/matching' });
    api.register(sessionRoutes, { prefix: '/sessions' });
    api.register(feedbackRoutes, { prefix: '/feedback' });
    api.register(coinRoutes, { prefix: '/coins' });
    api.register(friendRoutes, { prefix: '/friends' });
    api.register(reportRoutes, { prefix: '/reports' });
    api.register(betaRoutes, { prefix: '/beta' });
  }, { prefix: '/api/v1' });
}
