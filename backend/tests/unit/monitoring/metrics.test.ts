/**
 * Tests untuk Metrics Collector
 */

import { metrics, METRIC_NAMES } from '../../../src/monitoring/metrics';

describe('MetricsCollector', () => {
  beforeEach(() => {
    metrics.reset();
  });

  describe('increment', () => {
    it('should increment counter by 1 by default', () => {
      metrics.increment('test.counter');
      metrics.increment('test.counter');
      const snapshot = metrics.getSnapshot();
      expect(snapshot.counters['test.counter']).toBe(2);
    });

    it('should increment counter by custom value', () => {
      metrics.increment('test.counter', 5);
      const snapshot = metrics.getSnapshot();
      expect(snapshot.counters['test.counter']).toBe(5);
    });
  });

  describe('gauge', () => {
    it('should set gauge value', () => {
      metrics.gauge('test.gauge', 42);
      const snapshot = metrics.getSnapshot();
      expect(snapshot.gauges['test.gauge']).toBe(42);
    });

    it('should overwrite previous gauge value', () => {
      metrics.gauge('test.gauge', 10);
      metrics.gauge('test.gauge', 20);
      const snapshot = metrics.getSnapshot();
      expect(snapshot.gauges['test.gauge']).toBe(20);
    });
  });

  describe('histogram', () => {
    it('should record histogram values', () => {
      metrics.histogram('test.latency', 100);
      metrics.histogram('test.latency', 200);
      metrics.histogram('test.latency', 300);

      const snapshot = metrics.getSnapshot();
      const hist = snapshot.histograms['test.latency'];
      expect(hist).not.toBeNull();
      expect(hist!.count).toBe(3);
      expect(hist!.min).toBe(100);
      expect(hist!.max).toBe(300);
      expect(hist!.avg).toBe(200);
      expect(hist!.sum).toBe(600);
    });

    it('should handle single value', () => {
      metrics.histogram('test.single', 50);
      const snapshot = metrics.getSnapshot();
      const hist = snapshot.histograms['test.single'];
      expect(hist!.count).toBe(1);
      expect(hist!.min).toBe(50);
      expect(hist!.max).toBe(50);
    });
  });

  describe('measureAsync', () => {
    it('should measure async function duration and track success', async () => {
      const result = await metrics.measureAsync('test.async', async () => {
        return 'hello';
      });

      expect(result).toBe('hello');
      const snapshot = metrics.getSnapshot();
      expect(snapshot.counters['test.async.success']).toBe(1);
      expect(snapshot.histograms['test.async']).not.toBeNull();
    });

    it('should track errors and re-throw', async () => {
      await expect(
        metrics.measureAsync('test.async.fail', async () => {
          throw new Error('test error');
        })
      ).rejects.toThrow('test error');

      const snapshot = metrics.getSnapshot();
      expect(snapshot.counters['test.async.fail.error']).toBe(1);
    });
  });

  describe('getSnapshot', () => {
    it('should include system metrics', () => {
      const snapshot = metrics.getSnapshot();
      expect(snapshot.gauges['system.memory.rss']).toBeGreaterThan(0);
      expect(snapshot.gauges['system.memory.heapUsed']).toBeGreaterThan(0);
      expect(snapshot.gauges['system.uptime']).toBeGreaterThan(0);
      expect(snapshot.uptime).toBeGreaterThan(0);
    });

    it('should return empty counters after reset', () => {
      metrics.increment('test');
      metrics.reset();
      const snapshot = metrics.getSnapshot();
      expect(snapshot.counters['test']).toBeUndefined();
    });
  });

  describe('METRIC_NAMES', () => {
    it('should have all expected metric names', () => {
      expect(METRIC_NAMES.HTTP_REQUESTS_TOTAL).toBeDefined();
      expect(METRIC_NAMES.HTTP_REQUESTS_DURATION).toBeDefined();
      expect(METRIC_NAMES.SESSIONS_ACTIVE).toBeDefined();
      expect(METRIC_NAMES.MATCHES_FOUND).toBeDefined();
      expect(METRIC_NAMES.USERS_ONLINE).toBeDefined();
      expect(METRIC_NAMES.DB_QUERY_DURATION).toBeDefined();
    });
  });
});
