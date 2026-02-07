/**
 * Application Metrics Collector
 * 
 * Mengumpulkan metrik performa aplikasi:
 * - Request count & latency
 * - Active connections
 * - Database query performance
 * - Memory & CPU usage
 * - Business metrics (sessions, matches, etc.)
 */

import { createLogger } from '../utils/logger';

const logger = createLogger('Metrics');

interface MetricEntry {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

interface HistogramEntry {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
}

class MetricsCollector {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private startTime: number = Date.now();

  /**
   * Increment counter
   */
  increment(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  /**
   * Set gauge value
   */
  gauge(name: string, value: number): void {
    this.gauges.set(name, value);
  }

  /**
   * Record histogram value (e.g., response time)
   */
  histogram(name: string, value: number): void {
    const values = this.histograms.get(name) || [];
    values.push(value);
    // Keep last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
    this.histograms.set(name, values);
  }

  /**
   * Measure execution time of async function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.histogram(name, Date.now() - start);
      this.increment(`${name}.success`);
      return result;
    } catch (error) {
      this.histogram(name, Date.now() - start);
      this.increment(`${name}.error`);
      throw error;
    }
  }

  /**
   * Get histogram statistics
   */
  private getHistogramStats(name: string): HistogramEntry | null {
    const values = this.histograms.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  }

  /**
   * Collect system metrics
   */
  collectSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    this.gauge('system.memory.rss', memUsage.rss);
    this.gauge('system.memory.heapUsed', memUsage.heapUsed);
    this.gauge('system.memory.heapTotal', memUsage.heapTotal);
    this.gauge('system.memory.external', memUsage.external);
    this.gauge('system.uptime', process.uptime());

    // CPU usage
    const cpuUsage = process.cpuUsage();
    this.gauge('system.cpu.user', cpuUsage.user);
    this.gauge('system.cpu.system', cpuUsage.system);
  }

  /**
   * Get all metrics as snapshot
   */
  getSnapshot(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, HistogramEntry | null>;
    uptime: number;
  } {
    this.collectSystemMetrics();

    const counters: Record<string, number> = {};
    this.counters.forEach((v, k) => { counters[k] = v; });

    const gauges: Record<string, number> = {};
    this.gauges.forEach((v, k) => { gauges[k] = v; });

    const histograms: Record<string, HistogramEntry | null> = {};
    this.histograms.forEach((_, k) => {
      histograms[k] = this.getHistogramStats(k);
    });

    return {
      counters,
      gauges,
      histograms,
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Pre-defined metric names
export const METRIC_NAMES = {
  // HTTP
  HTTP_REQUESTS_TOTAL: 'http.requests.total',
  HTTP_REQUESTS_DURATION: 'http.requests.duration',
  HTTP_REQUESTS_ERROR: 'http.requests.error',

  // WebSocket
  WS_CONNECTIONS_ACTIVE: 'ws.connections.active',
  WS_MESSAGES_TOTAL: 'ws.messages.total',

  // Business
  SESSIONS_ACTIVE: 'business.sessions.active',
  SESSIONS_CREATED: 'business.sessions.created',
  MATCHES_FOUND: 'business.matches.found',
  MATCHING_QUEUE_SIZE: 'business.matching.queue_size',
  MATCHING_DURATION: 'business.matching.duration',
  GIFTS_SENT: 'business.gifts.sent',
  REPORTS_CREATED: 'business.reports.created',
  USERS_REGISTERED: 'business.users.registered',
  USERS_ONLINE: 'business.users.online',

  // Database
  DB_QUERY_DURATION: 'db.query.duration',
  DB_QUERY_ERROR: 'db.query.error',

  // Redis
  REDIS_COMMAND_DURATION: 'redis.command.duration',
  REDIS_COMMAND_ERROR: 'redis.command.error',
} as const;
