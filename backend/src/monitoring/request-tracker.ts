/**
 * Request Tracker Middleware
 * 
 * Fastify hook untuk tracking request metrics:
 * - Response time
 * - Status codes
 * - Error rates
 * - Per-route metrics
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { metrics, METRIC_NAMES } from './metrics';
import { createLogger } from '../utils/logger';

const logger = createLogger('RequestTracker');

/**
 * Register request tracking hooks pada Fastify
 */
export function registerRequestTracker(fastify: FastifyInstance): void {
  // Track request start time
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    (request as any).__startTime = Date.now();
    metrics.increment(METRIC_NAMES.HTTP_REQUESTS_TOTAL);
  });

  // Track response metrics
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = (request as any).__startTime;
    if (startTime) {
      const duration = Date.now() - startTime;
      metrics.histogram(METRIC_NAMES.HTTP_REQUESTS_DURATION, duration);

      // Track per-route
      const routeKey = `${request.method}:${request.routeOptions?.url || request.url}`;
      metrics.histogram(`http.route.${routeKey}.duration`, duration);
      metrics.increment(`http.route.${routeKey}.total`);

      // Track errors
      if (reply.statusCode >= 400) {
        metrics.increment(METRIC_NAMES.HTTP_REQUESTS_ERROR);
        metrics.increment(`http.status.${reply.statusCode}`);
      }

      // Log slow requests
      if (duration > 3000) {
        logger.warn({
          event: 'slow_request',
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          duration,
        });
      }
    }
  });

  // Track errors
  fastify.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
    metrics.increment(METRIC_NAMES.HTTP_REQUESTS_ERROR);
    logger.error({
      event: 'request_error',
      method: request.method,
      url: request.url,
      error: error.message,
      stack: error.stack,
    });
  });

  logger.info('Request tracker registered');
}
