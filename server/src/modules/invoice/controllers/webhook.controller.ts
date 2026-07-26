import { type Request, type Response, type NextFunction } from 'express';
import { InvoiceService } from '../services/invoice.service.js';
import { Status } from '../../../constants/status.js';

export class WebhookController {
  constructor(private readonly invoiceService: InvoiceService) {}

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.invoiceService.processInvoice(req.body);

      res.status(Status.OK).json(result);
    } catch (err) {
      next(err);
    }
  }
}
