import express from 'express';
import { getEnv } from './config/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/logger.js';
import { createInvoiceRoutes } from './modules/invoice/invoice.routes.js';
import { InvoiceRepository } from './modules/invoice/repositories/invoice.repository.js';
import { UsageAggregationService } from './modules/usage/services/aggregation.service.js';
import { EmailRenderService } from './modules/rendering/services/email-render.service.js';
import { PdfRenderService } from './modules/rendering/services/pdf-render.service.js';
import { PdfConverter } from './infrastructure/pdf-converter.service.js';
import { EmailService } from './infrastructure/email.service.js';
import { InvoiceService } from './modules/invoice/services/invoice.service.js';
import { WebhookController } from './modules/invoice/controllers/webhook.controller.js';
import { PortalController } from './modules/invoice/controllers/portal.controller.js';
import type { EmailService as IEmailService } from './infrastructure/email.service.js';

type AppDependencies = {
  emailService?: IEmailService;
};

export function createApp(deps?: AppDependencies) {
  const env = getEnv();
  const app = express();

  app.use(express.json());

  if (env.NODE_ENV !== 'test') {
    app.use(requestLogger);
  }

  const repository = new InvoiceRepository();
  const aggregationService = new UsageAggregationService();
  const pdfConverter = new PdfConverter();
  const emailRenderService = new EmailRenderService();
  const pdfRenderService = new PdfRenderService(pdfConverter);
  const emailService = deps?.emailService ?? new EmailService(
    env.SMTP_HOST,
    env.SMTP_PORT,
    env.SMTP_ENCRYPTION,
    env.SMTP_USER,
    env.SMTP_PASS,
    env.FROM_EMAIL,
    env.FROM_NAME,
  );
  const invoiceService = new InvoiceService(
    repository,
    aggregationService,
    emailRenderService,
    pdfRenderService,
    emailService,
    env.FRONTEND_URL,
  );

  const webhookController = new WebhookController(invoiceService);
  const portalController = new PortalController(invoiceService);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(createInvoiceRoutes(webhookController, portalController));

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  app.use(errorHandler);

  return { app, invoiceService };
}
