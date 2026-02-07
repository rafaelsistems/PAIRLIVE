import { FastifyInstance } from 'fastify';
import { CoinController } from '../controllers/coin.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export default async function coinRoutes(fastify: FastifyInstance) {
  const controller = new CoinController();

  // All routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // Balance
  fastify.get('/balance', controller.getBalance);

  // Transactions
  fastify.get('/transactions', controller.getTransactions);

  // Send gift
  fastify.post('/gift', controller.sendGift);

  // Purchase (In-App Purchase verification)
  fastify.post('/purchase', controller.purchaseCoins);
}
