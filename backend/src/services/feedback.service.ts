import { prisma } from '../config/database';
import { createLogger } from '../utils/logger';
import { TrustScoreService } from './trust-score.service';

const logger = createLogger('FeedbackService');
const trustScoreService = new TrustScoreService();

interface FeedbackData {
  sessionId: string;
  reviewerId: string;
  targetUserId: string;
  rating: number;
  comment?: string;
}

export class FeedbackService {
  async submitFeedback(data: FeedbackData): Promise<void> {
    const { sessionId, reviewerId, targetUserId, rating, comment } = data;

    // Verify session exists and involves both users
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw { code: 'NOT_FOUND' };
    }

    // Check that reviewer and target are in the session
    const sessionUsers = [session.user1Id, session.user2Id];
    if (!sessionUsers.includes(reviewerId) || !sessionUsers.includes(targetUserId)) {
      throw { code: 'INVALID_TARGET' };
    }

    // Check that target is the other user (not self)
    if (reviewerId === targetUserId) {
      throw { code: 'INVALID_TARGET' };
    }

    // Check if feedback already submitted
    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        sessionId_reviewerId: {
          sessionId,
          reviewerId,
        },
      },
    });

    if (existingFeedback) {
      throw { code: 'ALREADY_SUBMITTED' };
    }

    // Create feedback
    await prisma.feedback.create({
      data: {
        sessionId,
        reviewerId,
        targetUserId,
        rating,
        comment,
        createdAt: new Date(),
      },
    });

    // Update target user's average rating
    const targetFeedbacks = await prisma.feedback.findMany({
      where: { targetUserId },
      select: { rating: true },
    });

    const totalRatings = targetFeedbacks.length;
    const avgRating = targetFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalRatings;

    await prisma.user.update({
      where: { id: targetUserId },
      data: { averageRating: avgRating },
    });

    // Update trust score based on feedback
    await trustScoreService.updateFromFeedback(targetUserId, rating);

    logger.info(`Feedback submitted: session=${sessionId}, reviewer=${reviewerId}, target=${targetUserId}, rating=${rating}`);
  }
}
