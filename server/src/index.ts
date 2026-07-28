import 'dotenv/config';
import { createApp } from './app.js';
import { getEnv } from './config/index.js';
import { logger } from './infrastructure/logger.service.js';
import type { WebhookPayload } from './modules/invoice/entities/invoice.entity.js';

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  logger.error('Unhandled rejection', err);
  process.exit(1);
});

const env = getEnv();
const { app, invoiceService } = createApp();

function seedDemoData(): void {
  const demoPayload: WebhookPayload = {
    customer: {
      name: 'Acme Corp',
      email: 'billing@acme.com',
      accountId: '550e8400-e29b-41d4-a716-446655440000',
    },
    invoice: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      period: {
        start: '2026-06-01T00:00:00.000Z',
        end: '2026-07-01T00:00:00.000Z',
      },
      currency: 'USD',
      lineItems: [
        { description: 'API Calls', quantity: 235500, rate: 0.0002, amount: 47.10 },
        { description: 'Storage (GB)', quantity: 150, rate: 0.10, amount: 15.00 },
        { description: 'Overage Charges', quantity: 1, rate: 12.50, amount: 12.50 },
      ],
      subtotal: 74.60,
      tax: 5.97,
      total: 80.57,
    },
    usage: {
      dailyCallCounts: Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const isWeekend = day % 7 === 0 || day % 7 === 6;
        const base = isWeekend ? 5000 + Math.floor(Math.random() * 2000) : 8000 + Math.floor(Math.random() * 3000);
        return {
          date: `2026-06-${String(day).padStart(2, '0')}`,
          count: base,
        };
      }),
      latency: { average: 245, p95: 610 },
      callRecords: [
        { timestamp: '2026-06-01T08:23:15.000Z', endpoint: 'https://api.acme.com/v1/orders', responseTimeMs: 210 },
        { timestamp: '2026-06-01T09:15:00.000Z', endpoint: 'https://api.acme.com/v1/users', responseTimeMs: 185 },
        { timestamp: '2026-06-01T10:02:30.000Z', endpoint: 'https://api.acme.com/v1/search', responseTimeMs: 340 },
        { timestamp: '2026-06-02T07:45:00.000Z', endpoint: 'https://api.acme.com/v1/orders', responseTimeMs: 195 },
        { timestamp: '2026-06-02T11:30:00.000Z', endpoint: 'https://api.acme.com/v1/products', responseTimeMs: 160 },
        { timestamp: '2026-06-03T09:00:00.000Z', endpoint: 'https://api.acme.com/v1/analytics', responseTimeMs: 420 },
        { timestamp: '2026-06-03T14:20:00.000Z', endpoint: 'https://api.acme.com/v1/orders', responseTimeMs: 230 },
        { timestamp: '2026-06-04T08:10:00.000Z', endpoint: 'https://api.acme.com/v1/users', responseTimeMs: 175 },
        { timestamp: '2026-06-04T16:45:00.000Z', endpoint: 'https://api.acme.com/v1/search', responseTimeMs: 520 },
        { timestamp: '2026-06-05T10:30:00.000Z', endpoint: 'https://api.acme.com/v1/orders', responseTimeMs: 200 },
      ],
    },
  };

  invoiceService.processInvoice(demoPayload)
    .then(() => logger.info('Demo data seeded'))
    .catch(() => logger.warn('Failed to seed demo data (may already exist)'));
}

app.listen(env.PORT, () => {
  logger.info(`Kron server running on http://localhost:${env.PORT}`);
  seedDemoData();
});
