import { httpStatusCode } from '~constants/httpStatusCode';

// Base class for all HTTP errors
export abstract class HttpError extends Error {
  public abstract statusCode: number;
  public isOperational = true; // for trusted errors (not bugs)

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

// 4xx Client Errors
export class BadRequestError extends HttpError {
  statusCode = httpStatusCode.BAD_REQUEST;
  constructor(message = 'Bad Request') {
    super(message);
  }
}

export class UnauthorizedError extends HttpError {
  statusCode = httpStatusCode.UNAUTHORIZED;
  constructor(message = 'Unauthorized') {
    super(message);
  }
}

export class ForbiddenError extends HttpError {
  statusCode = httpStatusCode.FORBIDDEN;
  constructor(message = 'Forbidden') {
    super(message);
  }
}

export class NotFoundError extends HttpError {
  statusCode = httpStatusCode.NOT_FOUND;
  constructor(message = 'Not Found') {
    super(message);
  }
}

export class MethodNotAllowedError extends HttpError {
  statusCode = httpStatusCode.METHOD_NOT_ALLOWED;
  constructor(message = 'Method Not Allowed') {
    super(message);
  }
}

export class ConflictError extends HttpError {
  statusCode = httpStatusCode.CONFLICT;
  constructor(message = 'Conflict') {
    super(message);
  }
}

export class TooManyRequestsError extends HttpError {
  statusCode = httpStatusCode.TOO_MANY_REQUESTS;
  constructor(message = 'Too Many Requests') {
    super(message);
  }
}

// 5xx Server Errors
export class InternalServerError extends HttpError {
  statusCode = httpStatusCode.INTERNAL_SERVER_ERROR;
  isOperational = false;
  constructor(message = 'Internal Server Error') {
    super(message);
  }
}
