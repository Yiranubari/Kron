import { ErrorCodes } from '../constants/error-codes.js';
import { Status } from '../constants/status.js';

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundException extends AppError {
  constructor(code: string, message: string, details?: unknown) {
    super(code, message, Status.NOT_FOUND, details);
  }
}

export class ValidationException extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCodes.VALIDATION_ERROR, message, Status.BAD_REQUEST, details);
  }
}

export class InternalException extends AppError {
  constructor(code: string = ErrorCodes.INTERNAL_ERROR, message: string, details?: unknown) {
    super(code, message, Status.INTERNAL_SERVER_ERROR, details);
  }
}

export class RenderException extends InternalException {
  constructor(message: string, details?: unknown) {
    super(ErrorCodes.RENDER_ERROR, message, details);
  }
}

export class PdfConversionException extends InternalException {
  constructor(message: string, details?: unknown) {
    super(ErrorCodes.PDF_CONVERSION_ERROR, message, details);
  }
}

export class EmailSendException extends InternalException {
  constructor(message: string, details?: unknown) {
    super(ErrorCodes.EMAIL_SEND_ERROR, message, details);
  }
}

export class AggregationException extends InternalException {
  constructor(message: string, details?: unknown) {
    super(ErrorCodes.AGGREGATION_ERROR, message, details);
  }
}
