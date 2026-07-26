import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../exceptions/app-exceptions.js';
import { ErrorCodes } from '../constants/error-codes.js';
import { Status } from '../constants/status.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(Status.BAD_REQUEST).json({
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Request validation failed',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  console.error('Unhandled error:', err);

  res.status(Status.INTERNAL_SERVER_ERROR).json({
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: err.message || 'An unexpected error occurred',
    },
  });
}
