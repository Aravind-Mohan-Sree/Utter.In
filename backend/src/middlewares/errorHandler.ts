import { NextFunction, Request, Response } from 'express';
import { TokenValidationError } from '~/services/JwtService';
import { env } from '~config/env';
import { errorMessage } from '~constants/errorMessage';
import { httpStatusCode } from '~constants/httpStatusCode';
import { HttpError } from '~errors/HttpError';
import { logger } from '~logger/logger';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof HttpError) {
    logger.error(err);

    return res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  if (err instanceof TokenValidationError) {
    logger.error(err);

    return res.status(httpStatusCode.BAD_REQUEST).json({
      message: err.message,
      statusCode: httpStatusCode.BAD_REQUEST,
    });
  }

  if (err instanceof Error) {
    logger.error(err);

    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
      ...(env.NODE_ENV === 'development' && { debug: err.message }),
    });
  }

  logger.error('UNKNOWN ERROR THROWN', err);

  return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
    message: errorMessage.SOMETHING_WRONG,
  });
};
