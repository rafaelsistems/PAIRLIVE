/**
 * Beta Feedback System
 * 
 * Mengumpulkan feedback dari beta testers:
 * - In-app feedback forms
 * - Bug reports
 * - Feature requests
 * - Session quality reports
 */

import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { createLogger } from '../utils/logger';

const logger = createLogger('BetaFeedback');

type FeedbackType = 'bug' | 'feature_request' | 'general' | 'session_quality' | 'ui_ux';
type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
type FeedbackStatus = 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'wont_fix';

interface BetaFeedbackEntry {
  id: string;
  userId: string;
  type: FeedbackType;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  title: string;
  description: string;
  deviceInfo?: {
    platform: string;
    osVersion: string;
    appVersion: string;
    deviceModel: string;
  };
  screenshot?: string;
  sessionId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface FeedbackStats {
  total: number;
  byType: Record<FeedbackType, number>;
  byStatus: Record<FeedbackStatus, number>;
  byPriority: Record<FeedbackPriority, number>;
  avgResponseTimeHours: number;
}

const REDIS_KEY_PREFIX = 'beta:feedback:';

class BetaFeedbackService {
  /**
   * Submit beta feedback
   */
  async submit(data: {
    userId: string;
    type: FeedbackType;
    title: string;
    description: string;
    deviceInfo?: BetaFeedbackEntry['deviceInfo'];
    sessionId?: string;
    tags?: string[];
  }): Promise<{ id: string }> {
    const id = `bf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const entry: BetaFeedbackEntry = {
      id,
      userId: data.userId,
      type: data.type,
      priority: this.autoPrioritize(data.type, data.description),
      status: 'new',
      title: data.title,
      description: data.description,
      deviceInfo: data.deviceInfo,
      sessionId: data.sessionId,
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in Redis for fast access
    await redis.set(
      `${REDIS_KEY_PREFIX}${id}`,
      JSON.stringify(entry),
    );

    // Add to sorted set for listing
    await redis.zadd(
      `${REDIS_KEY_PREFIX}list`,
      Date.now().toString(),
      id,
    );

    // Increment counters
    await redis.incr(`${REDIS_KEY_PREFIX}count:total`);
    await redis.incr(`${REDIS_KEY_PREFIX}count:type:${data.type}`);
    await redis.incr(`${REDIS_KEY_PREFIX}count:status:new`);

    logger.info(`Beta feedback submitted: ${id} (${data.type}) by user ${data.userId}`);

    return { id };
  }

  /**
   * Auto-prioritize based on type and content
   */
  private autoPrioritize(type: FeedbackType, description: string): FeedbackPriority {
    const lowerDesc = description.toLowerCase();

    // Critical keywords
    if (lowerDesc.includes('crash') || lowerDesc.includes('data loss') || lowerDesc.includes('security')) {
      return 'critical';
    }

    // High priority keywords
    if (lowerDesc.includes('cannot') || lowerDesc.includes('broken') || lowerDesc.includes('error')) {
      return 'high';
    }

    // Type-based defaults
    if (type === 'bug') return 'medium';
    if (type === 'session_quality') return 'medium';

    return 'low';
  }

  /**
   * Get feedback by ID
   */
  async getById(id: string): Promise<BetaFeedbackEntry | null> {
    const data = await redis.get(`${REDIS_KEY_PREFIX}${id}`);
    if (!data) return null;
    return JSON.parse(data) as BetaFeedbackEntry;
  }

  /**
   * List feedback with pagination
   */
  async list(options: {
    page?: number;
    limit?: number;
    type?: FeedbackType;
    status?: FeedbackStatus;
  } = {}): Promise<{ items: BetaFeedbackEntry[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Get IDs from sorted set (newest first)
    const ids = await redis.zrevrange(`${REDIS_KEY_PREFIX}list`, start, end);
    const total = await redis.zcard(`${REDIS_KEY_PREFIX}list`);

    const items: BetaFeedbackEntry[] = [];
    for (const id of ids) {
      const entry = await this.getById(id);
      if (entry) {
        // Filter by type/status if specified
        if (options.type && entry.type !== options.type) continue;
        if (options.status && entry.status !== options.status) continue;
        items.push(entry);
      }
    }

    return { items, total };
  }

  /**
   * Update feedback status
   */
  async updateStatus(id: string, status: FeedbackStatus): Promise<void> {
    const entry = await this.getById(id);
    if (!entry) {
      throw new Error(`Feedback not found: ${id}`);
    }

    const oldStatus = entry.status;
    entry.status = status;
    entry.updatedAt = new Date();

    await redis.set(`${REDIS_KEY_PREFIX}${id}`, JSON.stringify(entry));

    // Update counters
    await redis.decr(`${REDIS_KEY_PREFIX}count:status:${oldStatus}`);
    await redis.incr(`${REDIS_KEY_PREFIX}count:status:${status}`);

    logger.info(`Feedback ${id} status updated: ${oldStatus} -> ${status}`);
  }

  /**
   * Get feedback statistics
   */
  async getStats(): Promise<FeedbackStats> {
    const total = parseInt(await redis.get(`${REDIS_KEY_PREFIX}count:total`) || '0', 10);

    const types: FeedbackType[] = ['bug', 'feature_request', 'general', 'session_quality', 'ui_ux'];
    const statuses: FeedbackStatus[] = ['new', 'reviewed', 'in_progress', 'resolved', 'wont_fix'];
    const priorities: FeedbackPriority[] = ['low', 'medium', 'high', 'critical'];

    const byType: Record<string, number> = {};
    for (const t of types) {
      byType[t] = parseInt(await redis.get(`${REDIS_KEY_PREFIX}count:type:${t}`) || '0', 10);
    }

    const byStatus: Record<string, number> = {};
    for (const s of statuses) {
      byStatus[s] = parseInt(await redis.get(`${REDIS_KEY_PREFIX}count:status:${s}`) || '0', 10);
    }

    const byPriority: Record<string, number> = {};
    for (const p of priorities) {
      byPriority[p] = parseInt(await redis.get(`${REDIS_KEY_PREFIX}count:priority:${p}`) || '0', 10);
    }

    return {
      total,
      byType: byType as Record<FeedbackType, number>,
      byStatus: byStatus as Record<FeedbackStatus, number>,
      byPriority: byPriority as Record<FeedbackPriority, number>,
      avgResponseTimeHours: 0, // TODO: Calculate from resolved entries
    };
  }
}

export const betaFeedback = new BetaFeedbackService();
