import type { z } from 'zod';
import type { CallRecordSchema } from '../usage.schema.js';
import type { AggregatedUsage, DailyCallCount, LatencyStats } from '../entities/usage-aggregate.entity.js';

type CallRecord = z.infer<typeof CallRecordSchema>;

export class UsageAggregationService {
  aggregate(records: CallRecord[]): AggregatedUsage {
    return {
      dailyCallCounts: this.groupByDate(records),
      latency: this.calculateLatency(records.map((r) => r.responseTimeMs)),
    };
  }

  private calculateLatency(responseTimes: number[]): LatencyStats {
    if (responseTimes.length === 0) {
      return { average: 0, p95: 0 };
    }

    const sum = responseTimes.reduce((acc, t) => acc + t, 0);
    const average = Math.round((sum / responseTimes.length) * 100) / 100;

    const sorted = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    const p95 = sorted[Math.max(0, p95Index)];

    return { average, p95 };
  }

  private groupByDate(records: CallRecord[]): DailyCallCount[] {
    const dailyMap = new Map<string, number>();

    for (const record of records) {
      const date = record.timestamp.split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
    }

    return [...dailyMap.keys()]
      .sort()
      .map((date) => ({ date, count: dailyMap.get(date) ?? 0 }));
  }
}
