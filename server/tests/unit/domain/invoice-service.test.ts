import { describe, it, expect, beforeEach } from 'vitest';
import { InvoiceService } from '../../../src/modules/invoice/services/invoice.service.js';
import { InvoiceRepository } from '../../../src/modules/invoice/repositories/invoice.repository.js';
import { UsageAggregationService } from '../../../src/modules/usage/services/aggregation.service.js';
import { createSamplePayload } from '../../fixtures/sample-payload.js';
import type { WebhookPayload } from '../../../src/modules/invoice/entities/invoice.entity.js';

class MockEmailRenderer {
  render(_payload: WebhookPayload, _portalUrl: string): string {
    return '<html><body>Mock Email</body></html>';
  }
}

class MockPdfRenderer {
  pdfConverter = { convert: async () => Buffer.from('mock-pdf-content') };

  async render(_payload: WebhookPayload): Promise<Buffer> {
    return Buffer.from('mock-pdf-content');
  }

  renderPreview(_payload: WebhookPayload): string {
    return '<html><body>Mock PDF Preview</body></html>';
  }
}

class MockEmailService {
  async send(_to: string, _subject: string, _html: string): Promise<void> {
  }
}

let service: InvoiceService;
let repository: InvoiceRepository;

beforeEach(() => {
  repository = new InvoiceRepository();
  service = new InvoiceService(
    repository,
    new UsageAggregationService(),
    new MockEmailRenderer(),
    new MockPdfRenderer(),
    new MockEmailService(),
    'http://localhost:5173',
  );
});

describe('InvoiceService', () => {
  it('processes invoice and returns URLs', async () => {
    const payload = createSamplePayload();

    const result = await service.processInvoice(payload);

    expect(result.invoiceId).toBe(payload.invoice.id);
    expect(result.portalUrl).toBe(`http://localhost:5173/portal/${payload.invoice.id}`);
    expect(result.pdfUrl).toBe(`/invoice/${payload.invoice.id}/pdf`);
  });

  it('stores invoice data after processing', async () => {
    const payload = createSamplePayload();

    await service.processInvoice(payload);

    expect(repository.exists(payload.invoice.id)).toBe(true);
  });

  it('stores rendered email and PDF', async () => {
    const payload = createSamplePayload();

    await service.processInvoice(payload);

    const stored = repository.findById(payload.invoice.id);
    expect(stored).toBeDefined();
    expect(stored!.renderedEmail).toBeDefined();
    expect(stored!.renderedPdf).toBeDefined();
  });

  it('returns portal data for stored invoice', async () => {
    const payload = createSamplePayload();
    await service.processInvoice(payload);

    const portalData = service.getPortalData(payload.invoice.id);

    expect(portalData.customer.name).toBe(payload.customer.name);
    expect(portalData.invoice.total).toBe(payload.invoice.total);
    expect(portalData.usage.latency.average).toBeGreaterThan(0);
  });

  it('includes correctly aggregated latency in portal data', async () => {
    const payload = createSamplePayload();
    await service.processInvoice(payload);

    const portalData = service.getPortalData(payload.invoice.id);

    const responseTimes = payload.usage.callRecords.map((r) => r.responseTimeMs);
    const expectedAverage = Math.round(
      (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 100,
    ) / 100;

    expect(portalData.usage.latency.average).toBe(expectedAverage);
  });

  it('throws NotFoundException for unknown invoice', () => {
    expect(() => service.getPortalData('unknown-id')).toThrow('Invoice not found');
  });

  it('creates one daily count entry per unique date in call records', async () => {
    const payload = createSamplePayload();
    await service.processInvoice(payload);

    const portalData = service.getPortalData(payload.invoice.id);

    const uniqueDates = new Set(
      payload.usage.callRecords.map((r) => r.timestamp.split('T')[0]),
    );
    expect(portalData.usage.dailyCallCounts).toHaveLength(uniqueDates.size);
    expect(portalData.usage.dailyCallCounts[0].date).toBe('2026-06-01');
    expect(portalData.usage.dailyCallCounts[0].count).toBe(1);
  });

  it('returns email preview for stored invoice', async () => {
    const payload = createSamplePayload();
    await service.processInvoice(payload);

    const emailHtml = service.getEmailPreview(payload.invoice.id);

    expect(emailHtml).toContain('Mock Email');
  });

  it('returns PDF buffer for stored invoice', async () => {
    const payload = createSamplePayload();
    await service.processInvoice(payload);

    const pdf = service.getPdfBuffer(payload.invoice.id);

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);
  });
});
