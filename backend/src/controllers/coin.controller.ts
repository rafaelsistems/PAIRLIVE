import { FastifyRequest, FastifyReply } from 'fastify';
import { CoinService } from '../services/coin.service';
import { sendSuccess, sendPaginated, errors } from '../utils/response';

const coinService = new CoinService();

interface GetTransactionsQuery {
  page?: number;
  limit?: number;
  type?: string;
}

interface SendGiftBody {
  sessionId: string;
  receiverId: string;
  giftType: string;
  coinAmount: number;
}

interface PurchaseBody {
  packageId: string;
  receipt: string;
  platform: 'ios' | 'android';
}

export class CoinController {
  async getBalance(request: FastifyRequest, reply: FastifyReply) {
    try {
      const balance = await coinService.getBalance(request.user.userId);

      return sendSuccess(reply, balance);
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async getTransactions(
    request: FastifyRequest<{ Querystring: GetTransactionsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const page = request.query.page || 1;
      const limit = Math.min(request.query.limit || 20, 50);
      const type = request.query.type;

      const { transactions, total } = await coinService.getTransactions(
        request.user.userId,
        page,
        limit,
        type
      );

      return sendPaginated(reply, transactions, page, limit, total);
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async sendGift(
    request: FastifyRequest<{ Body: SendGiftBody }>,
    reply: FastifyReply
  ) {
    try {
      const { sessionId, receiverId, giftType, coinAmount } = request.body;

      const result = await coinService.sendGift({
        senderId: request.user.userId,
        sessionId,
        receiverId,
        giftType,
        coinAmount,
      });

      return sendSuccess(reply, result, 'Gift sent successfully');
    } catch (error: any) {
      if (error.code === 'INSUFFICIENT_COINS') {
        return errors.insufficientCoins(reply);
      }
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'Session');
      }
      if (error.code === 'INVALID_RECEIVER') {
        return errors.badRequest(reply, 'Invalid receiver');
      }
      return errors.internal(reply);
    }
  }

  async purchaseCoins(
    request: FastifyRequest<{ Body: PurchaseBody }>,
    reply: FastifyReply
  ) {
    try {
      const { packageId, receipt, platform } = request.body;

      const result = await coinService.processPurchase({
        userId: request.user.userId,
        packageId,
        receipt,
        platform,
      });

      return sendSuccess(reply, result, 'Purchase successful');
    } catch (error: any) {
      if (error.code === 'INVALID_RECEIPT') {
        return errors.badRequest(reply, 'Invalid purchase receipt');
      }
      if (error.code === 'ALREADY_PROCESSED') {
        return errors.conflict(reply, 'Purchase already processed');
      }
      return errors.internal(reply);
    }
  }
}
