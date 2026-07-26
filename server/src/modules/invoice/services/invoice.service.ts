import { UsageAggregationService } from '../../usage/services/aggregation.service.js';
import type { PortalDataResponse, StoredInvoice, WebhookPayload } from '../entities/invoice.entity.js';
import { InvoiceRepository } from '../repositories/invoice.repository.js';
import { NotFoundException } from '../../../exceptions/app-exceptions.js';
import { ErrorCodes } from '../../../constants/error-codes.js';

export class InvoiceService {
  constructor(
    private readonly repository: InvoiceRepository,
    private readonly aggregationService: UsageAggregationService,
    private readonly frontendUrl: string,
  ) {}

  processInvoice(payload: WebhookPayload): {
    invoiceId: string;
    portalUrl: string;
    pdfUrl: string;
  } {
    const aggregatedUsage = this.aggregationService.aggregate(payload.usage.callRecords);

    const portalData: PortalDataResponse = {
      customer: payload.customer,
      invoice: payload.invoice,
      usage: {
        dailyCallCounts: aggregatedUsage.dailyCallCounts,
        latency: aggregatedUsage.latency,
        callRecords: payload.usage.callRecords,
      },
    };

    const stored: StoredInvoice = {
      payload,
      portalData,
    };

    this.repository.save(stored);

    const invoiceId = payload.invoice.id;

    return {
      invoiceId,
      portalUrl: `${this.frontendUrl}/portal/${invoiceId}`,
      pdfUrl: `/invoice/${invoiceId}/pdf`,
    };
  }

  getPortalData(invoiceId: string): PortalDataResponse {
    const stored = this.repository.findById(invoiceId);

    if (!stored) {
      throw new NotFoundException(ErrorCodes.INVOICE_NOT_FOUND, 'Invoice not found');
    }

    return stored.portalData;
  }

  getStoredInvoice(invoiceId: string): StoredInvoice | undefined {
    return this.repository.findById(invoiceId);
  }
}
