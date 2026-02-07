import { FastifyRequest, FastifyReply } from 'fastify';
import { FeedbackService } from '../services/feedback.service';
import { sendSuccess, errors } from '../utils/response';

const feedbackService = new FeedbackService();

interface SubmitFeedbackBody {
  sessionId: string;
  targetUserId: string;
  rating: number;
  comment?: string;
}

export class FeedbackController {
  async submitFeedback(
    request: FastifyRequest<{ Body: SubmitFeedbackBody }>,
    reply: FastifyReply
  ) {
    try {
      const { sessionId, targetUserId, rating, comment } = request.body;

      // Validate rating
      if (rating < 1 || rating > 5) {
        return errors.badRequest(reply, 'Rating must be between 1 and 5');
      }

      await feedbackService.submitFeedback({
        sessionId,
        reviewerId: request.user.userId,
        targetUserId,
        rating,
        comment,
      });

      return sendSuccess(reply, null, 'Feedback submitted');
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'Session');
      }
      if (error.code === 'ALREADY_SUBMITTED') {
        return errors.conflict(reply, 'Feedback already submitted');
      }
      if (error.code === 'INVALID_TARGET') {
        return errors.badRequest(reply, 'Invalid target user');
      }
      return errors.internal(reply);
    }
  }
}
