import { type Request, type Response, type NextFunction } from 'express';
import { type z } from 'zod';
import { AppError } from '../exceptions/app-exceptions.js';
import { ErrorCodes } from '../constants/error-codes.js';
import { Status } from '../constants/status.js';

export function validate(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'Request body validation failed',
        Status.BAD_REQUEST,
        result.error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      );
    }

    req.body = result.data;
    next();
  };
}
