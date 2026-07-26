import { MemoryStore } from '../../../infrastructure/memory-store.service.js';
import type { IRepository } from '../../../types/repository.interface.js';
import type { StoredInvoice } from '../entities/invoice.entity.js';

export class InvoiceRepository implements IRepository<StoredInvoice> {
  private store = new MemoryStore<StoredInvoice>();

  findById(id: string): StoredInvoice | undefined {
    return this.store.get(id);
  }

  save(entity: StoredInvoice): void {
    this.store.set(entity.payload.invoice.id, entity);
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  exists(id: string): boolean {
    return this.store.has(id);
  }
}
