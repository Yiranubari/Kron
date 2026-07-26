import { describe, it, expect, beforeEach } from 'vitest';
import { InvoiceRepository } from '../../../src/modules/invoice/repositories/invoice.repository.js';
import { createSamplePayload } from '../../fixtures/sample-payload.js';
import type { StoredInvoice } from '../../../src/modules/invoice/entities/invoice.entity.js';

let repository: InvoiceRepository;

function createStoredInvoice(): StoredInvoice {
  const payload = createSamplePayload();
  return { payload, portalData: { customer: payload.customer, invoice: payload.invoice, usage: payload.usage } };
}

beforeEach(() => {
  repository = new InvoiceRepository();
});

describe('InvoiceRepository', () => {
  it('returns undefined for unknown id', () => {
    const result = repository.findById('nonexistent-id');

    expect(result).toBeUndefined();
  });

  it('stores and retrieves an invoice', () => {
    const stored = createStoredInvoice();
    repository.save(stored);

    const result = repository.findById(stored.payload.invoice.id);

    expect(result).toBeDefined();
    expect(result!.payload.invoice.id).toBe(stored.payload.invoice.id);
  });

  it('returns true for exists when invoice is stored', () => {
    const stored = createStoredInvoice();
    repository.save(stored);

    expect(repository.exists(stored.payload.invoice.id)).toBe(true);
  });

  it('returns false for exists when invoice is not stored', () => {
    expect(repository.exists('nonexistent')).toBe(false);
  });

  it('deletes an existing invoice', () => {
    const stored = createStoredInvoice();
    repository.save(stored);

    const deleted = repository.delete(stored.payload.invoice.id);

    expect(deleted).toBe(true);
    expect(repository.findById(stored.payload.invoice.id)).toBeUndefined();
  });

  it('returns false when deleting nonexistent invoice', () => {
    expect(repository.delete('nonexistent')).toBe(false);
  });

  it('overwrites existing invoice on save with same id', () => {
    const stored = createStoredInvoice();
    repository.save(stored);

    const updatedPayload = {
      ...stored.payload,
      invoice: { ...stored.payload.invoice, total: 100 },
    };
    repository.save({ payload: updatedPayload, portalData: { customer: updatedPayload.customer, invoice: updatedPayload.invoice, usage: updatedPayload.usage } });

    const result = repository.findById(stored.payload.invoice.id);
    expect(result!.payload.invoice.total).toBe(100);
  });
});
