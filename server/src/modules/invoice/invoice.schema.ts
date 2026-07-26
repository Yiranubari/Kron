import { z } from 'zod';

export const CustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  accountId: z.string().uuid(),
}).strict();

export const PeriodSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
}).strict();

export const LineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().nonnegative(),
  rate: z.number().nonnegative(),
  amount: z.number().nonnegative(),
}).strict();

export const InvoiceDataSchema = z.object({
  id: z.string().uuid(),
  period: PeriodSchema,
  currency: z.string().length(3),
  lineItems: z.array(LineItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
}).strict();

export const InvoiceCallRecordSchema = z.object({
  timestamp: z.string().datetime(),
  endpoint: z.string().url(),
  responseTimeMs: z.number().nonnegative(),
}).strict();

export const InvoiceDailyCallCountSchema = z.object({
  date: z.string(),
  count: z.number().nonnegative(),
}).strict();

export const InvoiceLatencyStatsSchema = z.object({
  average: z.number().nonnegative(),
  p95: z.number().nonnegative(),
}).strict();

export const InvoiceUsageSchema = z.object({
  dailyCallCounts: z.array(InvoiceDailyCallCountSchema),
  latency: InvoiceLatencyStatsSchema,
  callRecords: z.array(InvoiceCallRecordSchema),
}).strict();

export const WebhookPayloadSchema = z.object({
  customer: CustomerSchema,
  invoice: InvoiceDataSchema,
  usage: InvoiceUsageSchema,
}).strict();

export const PortalDataResponseSchema = z.object({
  customer: CustomerSchema,
  invoice: InvoiceDataSchema,
  usage: z.object({
    dailyCallCounts: z.array(InvoiceDailyCallCountSchema),
    latency: InvoiceLatencyStatsSchema,
    callRecords: z.array(InvoiceCallRecordSchema),
  }).strict(),
}).strict();
