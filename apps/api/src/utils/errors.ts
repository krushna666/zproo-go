import { ErrorCode, type FieldIssue } from '@zproo/types';

/** Base class for errors whose message is safe to show to API clients. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly errorCode: ErrorCode,
    readonly details?: FieldIssue[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, ErrorCode.BAD_REQUEST);
  }
}

export class ValidationError extends AppError {
  constructor(details: FieldIssue[], message = 'Validation failed') {
    super(message, 400, ErrorCode.VALIDATION_ERROR, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, ErrorCode.UNAUTHENTICATED);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, ErrorCode.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, ErrorCode.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, ErrorCode.CONFLICT);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, ErrorCode.RATE_LIMITED);
  }
}

export class PaymentError extends AppError {
  constructor(message = 'Payment could not be processed') {
    super(message, 402, ErrorCode.PAYMENT_ERROR);
  }
}

export class ProviderError extends AppError {
  constructor(
    message = 'An upstream provider is unavailable',
    readonly provider?: string,
  ) {
    super(message, 502, ErrorCode.PROVIDER_ERROR);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, ErrorCode.SERVICE_UNAVAILABLE);
  }
}
