import { prisma } from '../config/database';
import { createLogger } from '../utils/logger';
import { TrustScoreService } from './trust-score.service';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('ReportService');
const trustScoreService = new TrustScoreService();

interface ReportData {
  sessionId: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description?: string;
}

// Report reasons
const REPORT_REASONS = [
  'INAPPROPRIATE_CONTENT',
  'HARASSMENT',
  'SPAM',
  'IMPERSONATION',
  'UNDERAGE',
  'SCAM',
  'OTHER',
];

export class ReportService {
  async submitReport(data: ReportData): Promise<void> {
    const { sessionId, reporterId, reportedUserId, reason, description } = data;

    // Validate reason
    if (!REPORT_REASONS.includes(reason)) {
      throw { code: 'INVALID_REASON' };
    }

    // Verify session exists and involves both users
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw { code: 'NOT_FOUND' };
    }

    // Check that both users are in the session
    const sessionUsers = [session.user1Id, session.user2Id];
    if (!sessionUsers.includes(reporterId) || !sessionUsers.includes(reportedUserId)) {
      throw { code: 'INVALID_TARGET' };
    }

    // Check not self-report
    if (reporterId === reportedUserId) {
      throw { code: 'INVALID_TARGET' };
    }

    // Check for existing report
    const existingReport = await prisma.report.findFirst({
      where: {
        sessionId,
        reporterId,
      },
    });

    if (existingReport) {
      throw { code: 'ALREADY_REPORTED' };
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        id: uuidv4(),
        sessionId,
        reporterId,
        reportedUserId,
        reason,
        description,
        status: 'PENDING',
        createdAt: new Date(),
      },
    });

    // Check for multiple reports against user
    const recentReports = await this.countRecentReports(reportedUserId);

    // Auto-action for multiple reports
    if (recentReports >= 5) {
      await this.handleMultipleReports(reportedUserId);
    }

    logger.info(`Report submitted: ${reporterId} reported ${reportedUserId}, reason: ${reason}`);
  }

  private async countRecentReports(userId: string): Promise<number> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return prisma.report.count({
      where: {
        reportedUserId: userId,
        createdAt: { gte: oneWeekAgo },
      },
    });
  }

  private async handleMultipleReports(userId: string): Promise<void> {
    logger.warn(`User ${userId} has multiple reports, applying restrictions`);

    // Apply trust score penalty
    await trustScoreService.updateFromBehavior(userId, 'REPORT_VALID');

    // If many reports, restrict matching
    const reportCount = await this.countRecentReports(userId);
    if (reportCount >= 10) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          trustCategory: 'RESTRICTED',
        },
      });

      logger.warn(`User ${userId} has been restricted due to reports`);
    }
  }

  // Admin method to review report
  async reviewReport(
    reportId: string,
    adminId: string,
    action: 'VALID' | 'INVALID' | 'DISMISSED'
  ): Promise<void> {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw { code: 'NOT_FOUND' };
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === 'VALID' ? 'RESOLVED' : 'DISMISSED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // Apply consequences based on review
    if (action === 'VALID') {
      await trustScoreService.updateFromBehavior(report.reportedUserId, 'REPORT_VALID');
    } else if (action === 'INVALID') {
      // False report - slightly penalize reporter
      await trustScoreService.updateFromBehavior(report.reporterId, 'FALSE_REPORT');
    }

    logger.info(`Report ${reportId} reviewed: ${action}`);
  }
}
