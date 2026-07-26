import type { z } from 'zod';
import type { AggregatedUsageSchema, DailyCallCountSchema, LatencyStatsSchema } from '../usage.schema.js';

export type DailyCallCount = z.infer<typeof DailyCallCountSchema>;
export type LatencyStats = z.infer<typeof LatencyStatsSchema>;
export type AggregatedUsage = z.infer<typeof AggregatedUsageSchema>;
