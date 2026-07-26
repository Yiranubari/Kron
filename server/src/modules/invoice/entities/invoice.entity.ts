import type { z } from 'zod';
import type {
  CustomerSchema,
  PeriodSchema,
  LineItemSchema,
  InvoiceDataSchema,
  InvoiceCallRecordSchema,
  InvoiceDailyCallCountSchema,
  InvoiceLatencyStatsSchema,
  InvoiceUsageSchema,
  WebhookPayloadSchema,
  PortalDataResponseSchema,
} from '../invoice.schema.js';

export type Customer = z.infer<typeof CustomerSchema>;
export type Period = z.infer<typeof PeriodSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;
export type InvoiceCallRecord = z.infer<typeof InvoiceCallRecordSchema>;
export type InvoiceDailyCallCount = z.infer<typeof InvoiceDailyCallCountSchema>;
export type InvoiceLatencyStats = z.infer<typeof InvoiceLatencyStatsSchema>;
export type InvoiceUsage = z.infer<typeof InvoiceUsageSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
export type PortalDataResponse = z.infer<typeof PortalDataResponseSchema>;

export type StoredInvoice = {
  payload: WebhookPayload;
  portalData: PortalDataResponse;
  renderedEmail?: string;
  renderedEmailText?: string;
  renderedPdf?: Buffer;
};
