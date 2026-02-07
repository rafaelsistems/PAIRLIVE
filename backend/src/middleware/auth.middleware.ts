import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken, TokenPayload } from '../services/token.service';
import { errors } from '../utils/response';

declare module 'fastify' {
  interface FastifyRequest {
    user: TokenPayload;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errors.unauthorized(reply, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      return errors.unauthorized(reply, 'Invalid or expired token');
    }

    request.user = payload;
  } catch (error) {
    return errors.unauthorized(reply, 'Authentication failed');
  }
}
