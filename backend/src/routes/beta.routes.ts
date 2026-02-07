/**
 * Beta Routes
 * 
 * Endpoint untuk beta testing management:
 * - Feature flags
 * - Beta feedback
 * - Beta user management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { featureFlags } from '../beta/feature-flags';
import { betaFeedback } from '../beta/beta-feedback';
import { sendSuccess, sendCreated, errors } from '../utils/response';

interface SubmitFeedbackBody {
  type: 'bug' | 'feature_request' | 'general' | 'session_quality' | 'ui_ux';
  title: string;
  description: string;
  deviceInfo?: {
    platform: string;
    osVersion: string;
    appVersion: string;
    deviceModel: string;
  };
  sessionId?: string;
  tags?: string[];
}

export default async function betaRoutes(fastify: FastifyInstance) {
  // Get feature flags for current user
  fastify.get(
    '/flags',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.userId;
      const flags = featureFlags.getAllFlags(userId);
      const isBeta = featureFlags.isBetaUser(userId);

      return sendSuccess(reply, { flags, isBetaUser: isBeta });
    }
  );

  // Submit beta feedback
  fastify.post(
    '/feedback',
    { preHandler: [authMiddleware] },
    async (
      request: FastifyRequest<{ Body: SubmitFeedbackBody }>,
      reply: FastifyReply
    ) => {
      try {
        const userId = request.user.userId;
        const { type, title, description, deviceInfo, sessionId, tags } = request.body;

        if (!title || !description) {
          return errors.badRequest(reply, 'Title dan description wajib diisi');
        }

        const result = await betaFeedback.submit({
          userId,
          type,
          title,
          description,
          deviceInfo,
          sessionId,
          tags,
        });

        return sendCreated(reply, result, 'Feedback berhasil dikirim');
      } catch (error) {
        return errors.internal(reply);
      }
    }
  );

  // Get feedback list (beta users only)
  fastify.get(
    '/feedback',
    { preHandler: [authMiddleware] },
    async (
      request: FastifyRequest<{
        Querystring: { page?: string; limit?: string; type?: string; status?: string };
      }>,
      reply: FastifyReply
    ) => {
      const { page, limit, type, status } = request.query as any;

      const result = await betaFeedback.list({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        type,
        status,
      });

      return sendSuccess(reply, result);
    }
  );

  // Get beta stats
  fastify.get(
    '/stats',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const stats = await betaFeedback.getStats();
      const betaUsersCount = featureFlags.getBetaUsersCount();

      return sendSuccess(reply, {
        feedback: stats,
        betaUsers: betaUsersCount,
      });
    }
  );
}
