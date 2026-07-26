import { describe, it, expect, beforeEach } from 'vitest';
import { InvoiceService } from '../../../src/modules/invoice/services/invoice.service.js';
import { InvoiceRepository } from '../../../src/modules/invoice/repositories/invoice.repository.js';
import { UsageAggregationService } from '../../../src/modules/usage/services/aggregation.service.js';
import { createSamplePayload } from '../../fixtures/sample-payload.js';

let service: InvoiceService;
let repository: InvoiceRepository;

beforeEach(() => {
  repository = new InvoiceRepository();
  service = new InvoiceService(repository, new UsageAggregationService(), 'http://localhost:5173');
});

describe('InvoiceService', () => {
  it('processes invoice and returns URLs', () => {
    const payload = createSamplePayload();

    const result = service.processInvoice(payload);

    expect(result.invoiceId).toBe(payload.invoice.id);
    expect(result.portalUrl).toBe(`http://localhost:5173/portal/${payload.invoice.id}`);
    expect(result.pdfUrl).toBe(`/invoice/${payload.invoice.id}/pdf`);
  });

  it('stores invoice data after processing', () => {
    const payload = createSamplePayload();

    service.processInvoice(payload);

    expect(repository.exists(payload.invoice.id)).toBe(true);
  });

  it('returns portal data for stored invoice', () => {
    const payload = createSamplePayload();
    service.processInvoice(payload);

    const portalData = service.getPortalData(payload.invoice.id);

    expect(portalData.customer.name).toBe(payload.customer.name);
    expect(portalData.invoice.total).toBe(payload.invoice.total);
    expect(portalData.usage.latency.average).toBeGreaterThan(0);
  });

  it('includes correctly aggregated latency in portal data', () => {
    const payload = createSamplePayload();
    service.processInvoice(payload);

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

  it('creates one daily count entry per unique date in call records', () => {
    const payload = createSamplePayload();
    service.processInvoice(payload);

    const portalData = service.getPortalData(payload.invoice.id);

    const uniqueDates = new Set(
      payload.usage.callRecords.map((r) => r.timestamp.split('T')[0]),
    );
    expect(portalData.usage.dailyCallCounts).toHaveLength(uniqueDates.size);
    expect(portalData.usage.dailyCallCounts[0].date).toBe('2026-06-01');
    expect(portalData.usage.dailyCallCounts[0].count).toBe(1);
  });
});
