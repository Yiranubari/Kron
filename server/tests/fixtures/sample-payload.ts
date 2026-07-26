import type { WebhookPayload } from '../../src/modules/invoice/entities/invoice.entity.js';

const baseResponseTimes = [120, 210, 95, 340, 180, 260, 150, 410, 200, 130, 310, 170, 220, 90, 380, 160, 280, 190, 350, 110];

export function createSamplePayload(overrides?: Partial<WebhookPayload>): WebhookPayload {
  return {
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
        { description: 'API Calls', quantity: 275000, rate: 0.0002, amount: 55.00 },
        { description: 'Storage', quantity: 150, rate: 0.10, amount: 15.00 },
      ],
      subtotal: 70.00,
      tax: 5.60,
      total: 75.60,
    },
    usage: {
      dailyCallCounts: [
        { date: '2026-06-01', count: 8500 },
        { date: '2026-06-02', count: 9200 },
      ],
      latency: {
        average: 245,
        p95: 610,
      },
      callRecords: baseResponseTimes.map((time, i) => ({
        timestamp: `2026-06-${String(i + 1).padStart(2, '0')}T08:00:00.000Z`,
        endpoint: 'https://api.acme.com/v1/orders',
        responseTimeMs: time,
      })),
    },
    ...overrides,
  };
}
