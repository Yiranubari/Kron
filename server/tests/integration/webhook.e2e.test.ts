import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { createSamplePayload } from '../fixtures/sample-payload.js';
import type { Express } from 'express';
import type { EmailService } from '../../src/infrastructure/email.service.js';

class MockE2eEmailService {
  async send(_to: string, _subject: string, _html: string): Promise<void> {
  }
}

let app: Express;

beforeAll(() => {
  process.env.SMTP_USER = 'test@example.com';
  process.env.SMTP_PASS = 'test-app-password';
  app = createApp({ emailService: new MockE2eEmailService() as unknown as EmailService });
});

describe('POST /webhook/invoice', () => {
  it('returns 200 with invoice details on valid payload', async () => {
    const payload = createSamplePayload();

    const res = await request(app)
      .post('/webhook/invoice')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('invoiceId');
    expect(res.body).toHaveProperty('portalUrl');
    expect(res.body).toHaveProperty('pdfUrl');
    expect(res.body.invoiceId).toBe(payload.invoice.id);
    expect(res.body.portalUrl).toContain('/portal/');
    expect(res.body.pdfUrl).toContain('/pdf');
  }, 15000);

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/webhook/invoice')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid field types', async () => {
    const payload = createSamplePayload({ invoice: { ...createSamplePayload().invoice, total: -1 } });

    const res = await request(app)
      .post('/webhook/invoice')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for unknown fields due to strict mode', async () => {
    const payload = { ...createSamplePayload(), unknownField: 'should not be here' };

    const res = await request(app)
      .post('/webhook/invoice')
      .send(payload);

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const payload = createSamplePayload({ customer: { ...createSamplePayload().customer, email: 'not-an-email' } });

    const res = await request(app)
      .post('/webhook/invoice')
      .send(payload);

    expect(res.status).toBe(400);
  });

  it('returns 400 for empty line items', async () => {
    const payload = createSamplePayload({ invoice: { ...createSamplePayload().invoice, lineItems: [] } });

    const res = await request(app)
      .post('/webhook/invoice')
      .send(payload);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/portal-data/:invoiceId', () => {
  it('returns portal data for existing invoice', async () => {
    const payload = createSamplePayload();
    const webhookRes = await request(app).post('/webhook/invoice').send(payload);
    const invoiceId = webhookRes.body.invoiceId;

    const res = await request(app).get(`/api/portal-data/${invoiceId}`);

    expect(res.status).toBe(200);
    expect(res.body.customer.name).toBe(payload.customer.name);
    expect(res.body.invoice.total).toBe(payload.invoice.total);
    expect(res.body.usage).toHaveProperty('dailyCallCounts');
    expect(res.body.usage).toHaveProperty('latency');
    expect(res.body.usage).toHaveProperty('callRecords');
  }, 15000);

  it('returns 404 for unknown invoice', async () => {
    const res = await request(app).get('/api/portal-data/nonexistent-id');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('INVOICE_NOT_FOUND');
  });
});

describe('GET /invoice/:invoiceId/pdf', () => {
  it('returns PDF with correct headers for existing invoice', async () => {
    const payload = createSamplePayload();
    const webhookRes = await request(app).post('/webhook/invoice').send(payload);
    const invoiceId = webhookRes.body.invoiceId;

    const res = await request(app).get(`/invoice/${invoiceId}/pdf`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.body).toBeInstanceOf(Buffer);
  }, 30000);

  it('returns 404 for unknown invoice', async () => {
    const res = await request(app).get('/invoice/nonexistent/pdf');

    expect(res.status).toBe(404);
  });
});

describe('GET /email/:invoiceId/preview', () => {
  it('returns email HTML for existing invoice', async () => {
    const payload = createSamplePayload();
    const webhookRes = await request(app).post('/webhook/invoice').send(payload);
    const invoiceId = webhookRes.body.invoiceId;

    const res = await request(app).get(`/email/${invoiceId}/preview`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
  }, 15000);

  it('returns 404 for unknown invoice', async () => {
    const res = await request(app).get('/email/nonexistent/preview');

    expect(res.status).toBe(404);
  });
});
