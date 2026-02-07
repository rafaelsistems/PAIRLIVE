import { FastifyRequest, FastifyReply } from 'fastify';
import { FriendService } from '../services/friend.service';
import { sendSuccess, sendPaginated, errors } from '../utils/response';

const friendService = new FriendService();

interface SendRequestBody {
  targetUserId: string;
}

interface GetFriendsQuery {
  page?: number;
  limit?: number;
}

export class FriendController {
  async getFriends(
    request: FastifyRequest<{ Querystring: GetFriendsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const page = request.query.page || 1;
      const limit = Math.min(request.query.limit || 20, 50);

      const { friends, total } = await friendService.getFriends(
        request.user.userId,
        page,
        limit
      );

      return sendPaginated(reply, friends, page, limit, total);
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async getRequests(request: FastifyRequest, reply: FastifyReply) {
    try {
      const requests = await friendService.getRequests(request.user.userId);

      return sendSuccess(reply, requests);
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async sendRequest(
    request: FastifyRequest<{ Body: SendRequestBody }>,
    reply: FastifyReply
  ) {
    try {
      const { targetUserId } = request.body;

      await friendService.sendRequest(request.user.userId, targetUserId);

      return sendSuccess(reply, null, 'Friend request sent');
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'User');
      }
      if (error.code === 'ALREADY_FRIENDS') {
        return errors.conflict(reply, 'Already friends');
      }
      if (error.code === 'REQUEST_EXISTS') {
        return errors.conflict(reply, 'Request already sent');
      }
      if (error.code === 'SELF_REQUEST') {
        return errors.badRequest(reply, 'Cannot send request to yourself');
      }
      return errors.internal(reply);
    }
  }

  async acceptRequest(
    request: FastifyRequest<{ Params: { requestId: string } }>,
    reply: FastifyReply
  ) {
    try {
      await friendService.acceptRequest(
        request.params.requestId,
        request.user.userId
      );

      return sendSuccess(reply, null, 'Friend request accepted');
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'Request');
      }
      if (error.code === 'NOT_AUTHORIZED') {
        return errors.forbidden(reply, 'Not authorized to accept this request');
      }
      return errors.internal(reply);
    }
  }

  async rejectRequest(
    request: FastifyRequest<{ Params: { requestId: string } }>,
    reply: FastifyReply
  ) {
    try {
      await friendService.rejectRequest(
        request.params.requestId,
        request.user.userId
      );

      return sendSuccess(reply, null, 'Friend request rejected');
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'Request');
      }
      return errors.internal(reply);
    }
  }

  async removeFriend(
    request: FastifyRequest<{ Params: { friendId: string } }>,
    reply: FastifyReply
  ) {
    try {
      await friendService.removeFriend(
        request.user.userId,
        request.params.friendId
      );

      return sendSuccess(reply, null, 'Friend removed');
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'Friendship');
      }
      return errors.internal(reply);
    }
  }
}
