import { type Request, type Response, type NextFunction } from 'express';
import { logger } from '../infrastructure/logger.service.js';

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  logger.info(`${req.method} ${req.path}`);
  next();
}
