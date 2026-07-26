import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SMTP_HOST: z.string().default('smtp.elasticemail.com'),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_ENCRYPTION: z.enum(['ssl', 'starttls']).default('starttls'),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  FROM_EMAIL: z.string().email().default('billing@kron.dev'),
  FROM_NAME: z.string().default('Kron Billing'),
});

let _env: z.infer<typeof envSchema> | null = null;

export function getEnv(): z.infer<typeof envSchema> {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}
