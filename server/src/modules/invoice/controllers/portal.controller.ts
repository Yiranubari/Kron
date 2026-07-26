import { type Request, type Response } from 'express';
import { InvoiceService } from '../services/invoice.service.js';
import { Status } from '../../../constants/status.js';

export class PortalController {
  constructor(private readonly invoiceService: InvoiceService) {}

  getPortalData(req: Request, res: Response): void {
    const data = this.invoiceService.getPortalData(req.params.invoiceId);

    res.status(Status.OK).json(data);
  }
}
