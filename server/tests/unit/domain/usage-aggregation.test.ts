import { describe, it, expect, beforeEach } from 'vitest';
import { UsageAggregationService } from '../../../src/modules/usage/services/aggregation.service.js';

let service: UsageAggregationService;

beforeEach(() => {
  service = new UsageAggregationService();
});

function makeRecord(timestamp: string, responseTimeMs: number, endpoint?: string) {
  return {
    timestamp,
    endpoint: endpoint ?? 'https://api.acme.com/v1/orders',
    responseTimeMs,
  };
}

describe('UsageAggregationService', () => {
  it('returns empty daily counts and zero latency for empty records', () => {
    const result = service.aggregate([]);

    expect(result.dailyCallCounts).toEqual([]);
    expect(result.latency.average).toBe(0);
    expect(result.latency.p95).toBe(0);
  });

  it('groups records by date and counts correctly', () => {
    const records = [
      makeRecord('2026-06-15T08:00:00.000Z', 100),
      makeRecord('2026-06-15T09:00:00.000Z', 200),
      makeRecord('2026-06-15T10:00:00.000Z', 300),
    ];

    const result = service.aggregate(records);

    expect(result.dailyCallCounts).toHaveLength(1);
    expect(result.dailyCallCounts[0]).toEqual({ date: '2026-06-15', count: 3 });
  });

  it('separates records from different days', () => {
    const records = [
      makeRecord('2026-06-15T08:00:00.000Z', 100),
      makeRecord('2026-06-16T08:00:00.000Z', 200),
      makeRecord('2026-06-17T08:00:00.000Z', 300),
    ];

    const result = service.aggregate(records);

    expect(result.dailyCallCounts).toHaveLength(3);
    expect(result.dailyCallCounts[0].date).toBe('2026-06-15');
    expect(result.dailyCallCounts[0].count).toBe(1);
    expect(result.dailyCallCounts[1].date).toBe('2026-06-16');
    expect(result.dailyCallCounts[1].count).toBe(1);
    expect(result.dailyCallCounts[2].date).toBe('2026-06-17');
    expect(result.dailyCallCounts[2].count).toBe(1);
  });

  it('sorts daily counts by date ascending', () => {
    const records = [
      makeRecord('2026-06-17T08:00:00.000Z', 100),
      makeRecord('2026-06-15T08:00:00.000Z', 200),
      makeRecord('2026-06-16T08:00:00.000Z', 300),
    ];

    const result = service.aggregate(records);

    expect(result.dailyCallCounts.map((d) => d.date)).toEqual([
      '2026-06-15',
      '2026-06-16',
      '2026-06-17',
    ]);
  });

  it('returns multiple counts for the same day across records', () => {
    const records = [
      makeRecord('2026-06-15T08:00:00.000Z', 100),
      makeRecord('2026-06-15T12:00:00.000Z', 200),
      makeRecord('2026-06-16T08:00:00.000Z', 300),
      makeRecord('2026-06-16T09:00:00.000Z', 400),
      makeRecord('2026-06-16T10:00:00.000Z', 500),
    ];

    const result = service.aggregate(records);

    expect(result.dailyCallCounts).toHaveLength(2);
    expect(result.dailyCallCounts[0]).toEqual({ date: '2026-06-15', count: 2 });
    expect(result.dailyCallCounts[1]).toEqual({ date: '2026-06-16', count: 3 });
  });

  it('calculates correct average latency', () => {
    const records = [
      makeRecord('2026-06-15T08:00:00.000Z', 100),
      makeRecord('2026-06-15T09:00:00.000Z', 200),
      makeRecord('2026-06-15T10:00:00.000Z', 300),
    ];

    const result = service.aggregate(records);

    expect(result.latency.average).toBe(200);
  });

  it('rounds average latency to two decimal places', () => {
    const records = [
      makeRecord('2026-06-15T08:00:00.000Z', 100),
      makeRecord('2026-06-15T09:00:00.000Z', 105),
      makeRecord('2026-06-15T10:00:00.000Z', 110),
    ];

    const result = service.aggregate(records);
    const sum = 100 + 105 + 110;
    const expected = Math.round((sum / 3) * 100) / 100;

    expect(result.latency.average).toBe(expected);
  });

  it('calculates p95 latency correctly with many records', () => {
    const records = Array.from({ length: 100 }, (_, i) =>
      makeRecord('2026-06-15T08:00:00.000Z', i + 1),
    );

    const result = service.aggregate(records);

    const sorted = records.map((r) => r.responseTimeMs).sort((a, b) => a - b);
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    expect(result.latency.p95).toBe(sorted[p95Index]);
  });

  it('returns the only response time as both average and p95 for single record', () => {
    const records = [makeRecord('2026-06-15T08:00:00.000Z', 342)];

    const result = service.aggregate(records);

    expect(result.latency.average).toBe(342);
    expect(result.latency.p95).toBe(342);
  });

  it('handles records with same timestamp at different times', () => {
    const records = [
      makeRecord('2026-06-15T23:59:59.000Z', 100),
      makeRecord('2026-06-16T00:00:01.000Z', 200),
    ];

    const result = service.aggregate(records);

    expect(result.dailyCallCounts).toHaveLength(2);
    expect(result.dailyCallCounts[0]).toEqual({ date: '2026-06-15', count: 1 });
    expect(result.dailyCallCounts[1]).toEqual({ date: '2026-06-16', count: 1 });
  });
});
