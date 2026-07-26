import { type Request, type Response } from 'express';
import { InvoiceService } from '../services/invoice.service.js';
import { Status } from '../../../constants/status.js';

export class WebhookController {
  constructor(private readonly invoiceService: InvoiceService) {}

  handleWebhook(req: Request, res: Response): void {
    const result = this.invoiceService.processInvoice(req.body);

    res.status(Status.OK).json(result);
  }
}
