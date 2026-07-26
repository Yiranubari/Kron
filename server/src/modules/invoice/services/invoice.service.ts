import { UsageAggregationService } from '../../usage/services/aggregation.service.js';
import type { PortalDataResponse, StoredInvoice, WebhookPayload } from '../entities/invoice.entity.js';
import { InvoiceRepository } from '../repositories/invoice.repository.js';
import { EmailRenderService } from '../../rendering/services/email-render.service.js';
import { PdfRenderService } from '../../rendering/services/pdf-render.service.js';
import { NotFoundException } from '../../../exceptions/app-exceptions.js';
import { ErrorCodes } from '../../../constants/error-codes.js';

export class InvoiceService {
  constructor(
    private readonly repository: InvoiceRepository,
    private readonly aggregationService: UsageAggregationService,
    private readonly emailRenderService: EmailRenderService,
    private readonly pdfRenderService: PdfRenderService,
    private readonly frontendUrl: string,
  ) {}

  async processInvoice(payload: WebhookPayload): Promise<{
    invoiceId: string;
    portalUrl: string;
    pdfUrl: string;
  }> {
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

    const invoiceId = payload.invoice.id;
    const portalUrl = `${this.frontendUrl}/portal/${invoiceId}`;
    const pdfUrl = `/invoice/${invoiceId}/pdf`;

    const emailHtml = this.emailRenderService.render(payload, portalUrl);
    const pdfBuffer = await this.pdfRenderService.render(payload);

    const stored: StoredInvoice = {
      payload,
      portalData,
      renderedEmail: emailHtml,
      renderedPdf: pdfBuffer,
    };

    this.repository.save(stored);

    return { invoiceId, portalUrl, pdfUrl };
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

  getEmailPreview(invoiceId: string): string {
    const stored = this.repository.findById(invoiceId);

    if (!stored || !stored.renderedEmail) {
      throw new NotFoundException(ErrorCodes.INVOICE_NOT_FOUND, 'Invoice not found or email not rendered');
    }

    return stored.renderedEmail;
  }

  getPdfBuffer(invoiceId: string): Buffer {
    const stored = this.repository.findById(invoiceId);

    if (!stored || !stored.renderedPdf) {
      throw new NotFoundException(ErrorCodes.INVOICE_NOT_FOUND, 'Invoice not found or PDF not rendered');
    }

    return stored.renderedPdf;
  }
}
