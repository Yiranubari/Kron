import { type Request, type Response, type NextFunction } from 'express';
import { InvoiceService } from '../services/invoice.service.js';
import { Status } from '../../../constants/status.js';

export class PortalController {
  constructor(private readonly invoiceService: InvoiceService) {}

  getPortalData(req: Request, res: Response): void {
    const data = this.invoiceService.getPortalData(req.params.invoiceId);

    res.status(Status.OK).json(data);
  }

  downloadPdf(req: Request, res: Response, next: NextFunction): void {
    try {
      const pdfBuffer = this.invoiceService.getPdfBuffer(req.params.invoiceId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${req.params.invoiceId}.pdf"`);
      res.status(Status.OK).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  previewEmail(req: Request, res: Response): void {
    const emailHtml = this.invoiceService.getEmailPreview(req.params.invoiceId);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(Status.OK).send(emailHtml);
  }

  async sendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        res.status(Status.BAD_REQUEST).json({
          error: { code: 'VALIDATION_ERROR', message: 'Email is required' },
        });
        return;
      }

      await this.invoiceService.sendEmail(req.params.invoiceId, email);
      res.status(Status.OK).json({ message: 'Invoice sent to your email.' });
    } catch (err) {
      next(err);
    }
  }
}
