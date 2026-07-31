import { z } from 'zod';

export const RenderOptionsSchema = z.object({
  fromEmail: z.string().email(),
  fromName: z.string(),
}).strict();
