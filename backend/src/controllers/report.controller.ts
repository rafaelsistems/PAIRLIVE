import { FastifyRequest, FastifyReply } from 'fastify';
import { ReportService } from '../services/report.service';
import { sendSuccess, errors } from '../utils/response';

const reportService = new ReportService();

interface SubmitReportBody {
  sessionId: string;
  reportedUserId: string;
  reason: string;
  description?: string;
}

export class ReportController {
  async submitReport(
    request: FastifyRequest<{ Body: SubmitReportBody }>,
    reply: FastifyReply
  ) {
    try {
      const { sessionId, reportedUserId, reason, description } = request.body;

      await reportService.submitReport({
        sessionId,
        reporterId: request.user.userId,
        reportedUserId,
        reason,
        description,
      });

      return sendSuccess(reply, null, 'Report submitted');
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'Session');
      }
      if (error.code === 'INVALID_TARGET') {
        return errors.badRequest(reply, 'Invalid target user');
      }
      if (error.code === 'ALREADY_REPORTED') {
        return errors.conflict(reply, 'Already reported this session');
      }
      return errors.internal(reply);
    }
  }
}
