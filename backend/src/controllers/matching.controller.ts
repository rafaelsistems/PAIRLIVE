import { FastifyRequest, FastifyReply } from 'fastify';
import { MatchingService } from '../services/matching.service';
import { sendSuccess, errors } from '../utils/response';

const matchingService = new MatchingService();

export class MatchingController {
  async joinQueue(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await matchingService.joinQueue(request.user.userId);

      return sendSuccess(reply, result, 'Joined matching queue');
    } catch (error: any) {
      if (error.code === 'ALREADY_IN_QUEUE') {
        return errors.conflict(reply, 'Already in matching queue');
      }
      if (error.code === 'RESTRICTED') {
        return errors.forbidden(reply, 'Matching restricted due to trust score');
      }
      if (error.code === 'IN_SESSION') {
        return errors.conflict(reply, 'Already in active session');
      }
      return errors.internal(reply);
    }
  }

  async leaveQueue(request: FastifyRequest, reply: FastifyReply) {
    try {
      await matchingService.leaveQueue(request.user.userId);

      return sendSuccess(reply, null, 'Left matching queue');
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async getQueueStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const status = await matchingService.getQueueStatus(request.user.userId);

      return sendSuccess(reply, status);
    } catch (error) {
      return errors.internal(reply);
    }
  }
}
