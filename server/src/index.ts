import 'dotenv/config';
import { createApp } from './app.js';
import { getEnv } from './config/index.js';
import { logger } from './infrastructure/logger.service.js';

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  logger.error('Unhandled rejection', err);
  process.exit(1);
});

const env = getEnv();
const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Kron server running on http://localhost:${env.PORT}`);
});
