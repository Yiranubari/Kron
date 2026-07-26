import { z } from 'zod';

export const RenderOptionsSchema = z.object({
  fromEmail: z.string().email().default('billing@kron.dev'),
  fromName: z.string().default('Kron Billing'),
}).strict();
