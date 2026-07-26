import { type Request, type Response } from 'express';
import { InvoiceService } from '../services/invoice.service.js';
import { Status } from '../../../constants/status.js';

export class PortalController {
  constructor(private readonly invoiceService: InvoiceService) {}

  getPortalData(req: Request, res: Response): void {
    const data = this.invoiceService.getPortalData(req.params.invoiceId);

    res.status(Status.OK).json(data);
  }

  downloadPdf(req: Request, res: Response): void {
    const pdfBuffer = this.invoiceService.getPdfBuffer(req.params.invoiceId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${req.params.invoiceId}.pdf"`);
    res.status(Status.OK).send(pdfBuffer);
  }

  previewEmail(req: Request, res: Response): void {
    const emailHtml = this.invoiceService.getEmailPreview(req.params.invoiceId);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(Status.OK).send(emailHtml);
  }
}
