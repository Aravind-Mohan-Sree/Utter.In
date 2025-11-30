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
  statusCode = 400;
  constructor(message = 'Bad Request') {
    super(message);
  }
}

export class UnauthorizedError extends HttpError {
  statusCode = 401;
  constructor(message = 'Unauthorized') {
    super(message);
  }
}

export class PaymentRequiredError extends HttpError {
  statusCode = 402;
  constructor(message = 'Payment Required') {
    super(message);
  }
}

export class ForbiddenError extends HttpError {
  statusCode = 403;
  constructor(message = 'Forbidden') {
    super(message);
  }
}

export class NotFoundError extends HttpError {
  statusCode = 404;
  constructor(message = 'Not Found') {
    super(message);
  }
}

export class MethodNotAllowedError extends HttpError {
  statusCode = 405;
  constructor(message = 'Method Not Allowed') {
    super(message);
  }
}

export class ConflictError extends HttpError {
  statusCode = 409;
  constructor(message = 'Conflict') {
    super(message);
  }
}

export class GoneError extends HttpError {
  statusCode = 410;
  constructor(message = 'Gone') {
    super(message);
  }
}

export class UnsupportedMediaTypeError extends HttpError {
  statusCode = 415;
  constructor(message = 'Unsupported Media Type') {
    super(message);
  }
}

export class UnprocessableEntityError extends HttpError {
  statusCode = 422;
  constructor(message = 'Unprocessable Entity') {
    super(message);
  }
}

export class TooManyRequestsError extends HttpError {
  statusCode = 429;
  constructor(message = 'Too Many Requests') {
    super(message);
  }
}

// 5xx Server Errors
export class InternalServerError extends HttpError {
  statusCode = 500;
  isOperational = false; // true bugs
  constructor(message = 'Internal Server Error') {
    super(message);
  }
}

export class NotImplementedError extends HttpError {
  statusCode = 501;
  constructor(message = 'Not Implemented') {
    super(message);
  }
}

export class BadGatewayError extends HttpError {
  statusCode = 502;
  constructor(message = 'Bad Gateway') {
    super(message);
  }
}

export class ServiceUnavailableError extends HttpError {
  statusCode = 503;
  constructor(message = 'Service Unavailable') {
    super(message);
  }
}

export class GatewayTimeoutError extends HttpError {
  statusCode = 504;
  constructor(message = 'Gateway Timeout') {
    super(message);
  }
}
