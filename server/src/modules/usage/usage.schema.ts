import { z } from 'zod';

export const CallRecordSchema = z.object({
  timestamp: z.string().datetime(),
  endpoint: z.string().url(),
  responseTimeMs: z.number().nonnegative(),
}).strict();

export const DailyCallCountSchema = z.object({
  date: z.string(),
  count: z.number().nonnegative(),
}).strict();

export const LatencyStatsSchema = z.object({
  average: z.number().nonnegative(),
  p95: z.number().nonnegative(),
}).strict();

export const AggregatedUsageSchema = z.object({
  dailyCallCounts: z.array(DailyCallCountSchema),
  latency: LatencyStatsSchema,
}).strict();
