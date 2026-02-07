import { FastifyRequest, FastifyReply } from 'fastify';
import { SessionService } from '../services/session.service';
import { sendSuccess, sendPaginated, errors } from '../utils/response';

const sessionService = new SessionService();

interface GetHistoryQuery {
  page?: number;
  limit?: number;
}

export class SessionController {
  async getActiveSession(request: FastifyRequest, reply: FastifyReply) {
    try {
      const session = await sessionService.getActiveSession(request.user.userId);

      if (!session) {
        return errors.notFound(reply, 'Active session');
      }

      return sendSuccess(reply, session);
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async skipSession(
    request: FastifyRequest<{ Params: { sessionId: string } }>,
    reply: FastifyReply
  ) {
    try {
      await sessionService.skipSession(
        request.params.sessionId,
        request.user.userId
      );

      return sendSuccess(reply, null, 'Session skipped');
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'Session');
      }
      if (error.code === 'NOT_AUTHORIZED') {
        return errors.forbidden(reply, 'Not authorized to skip this session');
      }
      if (error.code === 'SKIP_COOLDOWN') {
        return errors.badRequest(reply, 'Skip cooldown active, please wait');
      }
      return errors.internal(reply);
    }
  }

  async endSession(
    request: FastifyRequest<{ Params: { sessionId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await sessionService.endSession(
        request.params.sessionId,
        request.user.userId
      );

      return sendSuccess(reply, result, 'Session ended');
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'Session');
      }
      if (error.code === 'NOT_AUTHORIZED') {
        return errors.forbidden(reply, 'Not authorized to end this session');
      }
      return errors.internal(reply);
    }
  }

  async getAgoraToken(
    request: FastifyRequest<{ Params: { sessionId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const token = await sessionService.getAgoraToken(
        request.params.sessionId,
        request.user.userId
      );

      return sendSuccess(reply, { token });
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'Session');
      }
      if (error.code === 'NOT_AUTHORIZED') {
        return errors.forbidden(reply, 'Not authorized for this session');
      }
      return errors.internal(reply);
    }
  }

  async getHistory(
    request: FastifyRequest<{ Querystring: GetHistoryQuery }>,
    reply: FastifyReply
  ) {
    try {
      const page = request.query.page || 1;
      const limit = Math.min(request.query.limit || 20, 50);

      const { sessions, total } = await sessionService.getHistory(
        request.user.userId,
        page,
        limit
      );

      return sendPaginated(reply, sessions, page, limit, total);
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async getSessionDetails(
    request: FastifyRequest<{ Params: { sessionId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const session = await sessionService.getSessionDetails(
        request.params.sessionId,
        request.user.userId
      );

      if (!session) {
        return errors.notFound(reply, 'Session');
      }

      return sendSuccess(reply, session);
    } catch (error) {
      return errors.internal(reply);
    }
  }
}
