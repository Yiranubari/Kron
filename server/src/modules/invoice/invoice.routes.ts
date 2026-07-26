import { Router } from 'express';
import { WebhookPayloadSchema } from './invoice.schema.js';
import { validate } from '../../middleware/validator.js';
import { WebhookController } from './controllers/webhook.controller.js';
import { PortalController } from './controllers/portal.controller.js';

export function createInvoiceRoutes(
  webhookController: WebhookController,
  portalController: PortalController,
): Router {
  const router = Router();

  router.post(
    '/webhook/invoice',
    validate(WebhookPayloadSchema),
    webhookController.handleWebhook.bind(webhookController),
  );

  router.get(
    '/api/portal-data/:invoiceId',
    portalController.getPortalData.bind(portalController),
  );

  return router;
}
