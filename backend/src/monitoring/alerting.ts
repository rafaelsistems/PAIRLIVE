/**
 * Alerting System
 * 
 * Sistem alerting untuk mendeteksi dan memberitahu masalah:
 * - Error rate tinggi
 * - Response time lambat
 * - Memory usage tinggi
 * - Database/Redis down
 * - Business anomalies
 */

import { createLogger } from '../utils/logger';
import { metrics, METRIC_NAMES } from './metrics';

const logger = createLogger('Alerting');

type AlertSeverity = 'info' | 'warning' | 'critical';
type AlertStatus = 'firing' | 'resolved';

interface Alert {
  id: string;
  name: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  timestamp: number;
  resolvedAt?: number;
  metadata?: Record<string, any>;
}

interface AlertRule {
  name: string;
  severity: AlertSeverity;
  check: () => boolean;
  message: () => string;
  cooldownMs: number;
}

class AlertingService {
  private alerts: Map<string, Alert> = new Map();
  private lastFired: Map<string, number> = new Map();
  private rules: AlertRule[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.registerDefaultRules();
  }

  /**
   * Register default alert rules
   */
  private registerDefaultRules(): void {
    // High memory usage
    this.addRule({
      name: 'high_memory_usage',
      severity: 'warning',
      check: () => {
        const mem = process.memoryUsage();
        return (mem.heapUsed / mem.heapTotal) > 0.85;
      },
      message: () => {
        const mem = process.memoryUsage();
        const pct = ((mem.heapUsed / mem.heapTotal) * 100).toFixed(1);
        return `Memory usage tinggi: ${pct}%`;
      },
      cooldownMs: 5 * 60 * 1000, // 5 menit
    });

    // Critical memory usage
    this.addRule({
      name: 'critical_memory_usage',
      severity: 'critical',
      check: () => {
        const mem = process.memoryUsage();
        return (mem.heapUsed / mem.heapTotal) > 0.95;
      },
      message: () => {
        const mem = process.memoryUsage();
        const pct = ((mem.heapUsed / mem.heapTotal) * 100).toFixed(1);
        return `Memory usage kritis: ${pct}%`;
      },
      cooldownMs: 2 * 60 * 1000, // 2 menit
    });

    // High error rate
    this.addRule({
      name: 'high_error_rate',
      severity: 'warning',
      check: () => {
        const snapshot = metrics.getSnapshot();
        const total = snapshot.counters[METRIC_NAMES.HTTP_REQUESTS_TOTAL] || 0;
        const errors = snapshot.counters[METRIC_NAMES.HTTP_REQUESTS_ERROR] || 0;
        if (total < 10) return false; // Minimum sample
        return (errors / total) > 0.1; // >10% error rate
      },
      message: () => {
        const snapshot = metrics.getSnapshot();
        const total = snapshot.counters[METRIC_NAMES.HTTP_REQUESTS_TOTAL] || 0;
        const errors = snapshot.counters[METRIC_NAMES.HTTP_REQUESTS_ERROR] || 0;
        const rate = total > 0 ? ((errors / total) * 100).toFixed(1) : '0';
        return `Error rate tinggi: ${rate}% (${errors}/${total})`;
      },
      cooldownMs: 5 * 60 * 1000,
    });
  }

  /**
   * Add custom alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  /**
   * Evaluate all rules
   */
  evaluate(): void {
    const now = Date.now();

    for (const rule of this.rules) {
      const lastFiredAt = this.lastFired.get(rule.name) || 0;
      const inCooldown = (now - lastFiredAt) < rule.cooldownMs;

      try {
        const isFiring = rule.check();

        if (isFiring && !inCooldown) {
          this.fire(rule, now);
        } else if (!isFiring && this.alerts.has(rule.name)) {
          this.resolve(rule.name, now);
        }
      } catch (error) {
        logger.error(`Error evaluating rule ${rule.name}:`, error);
      }
    }
  }

  /**
   * Fire an alert
   */
  private fire(rule: AlertRule, timestamp: number): void {
    const alert: Alert = {
      id: `${rule.name}_${timestamp}`,
      name: rule.name,
      severity: rule.severity,
      status: 'firing',
      message: rule.message(),
      timestamp,
    };

    this.alerts.set(rule.name, alert);
    this.lastFired.set(rule.name, timestamp);

    // Log alert
    const logFn = rule.severity === 'critical' ? logger.error : logger.warn;
    logFn.call(logger, `🚨 ALERT [${rule.severity.toUpperCase()}] ${alert.message}`);

    // Notify (extensible - webhook, email, etc.)
    this.notify(alert);
  }

  /**
   * Resolve an alert
   */
  private resolve(name: string, timestamp: number): void {
    const alert = this.alerts.get(name);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = timestamp;
      logger.info(`✅ RESOLVED [${alert.severity.toUpperCase()}] ${alert.name}`);
      this.alerts.delete(name);
    }
  }

  /**
   * Send notification (extensible)
   */
  private async notify(alert: Alert): Promise<void> {
    // Log-based notification (always)
    logger.warn({
      event: 'alert_fired',
      alert: {
        id: alert.id,
        name: alert.name,
        severity: alert.severity,
        message: alert.message,
      },
    });

    // TODO: Webhook notification
    // TODO: Email notification
    // TODO: Slack/Discord notification
  }

  /**
   * Start periodic evaluation
   */
  start(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.evaluate();
    }, intervalMs);

    logger.info(`Alerting started (interval: ${intervalMs}ms, rules: ${this.rules.length})`);
  }

  /**
   * Stop periodic evaluation
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    logger.info('Alerting stopped');
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => a.status === 'firing');
  }

  /**
   * Get all alerts (including resolved)
   */
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }
}

export const alerting = new AlertingService();
