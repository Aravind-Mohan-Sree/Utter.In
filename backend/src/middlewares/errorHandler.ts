import { NextFunction, Request, Response } from 'express';
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

  if (err instanceof Error) {
    logger.error(err);

    return res.status(500).json({
      message: 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { debug: err.message }),
    });
  }

  logger.error('UNKNOWN ERROR THROWN', err);

  return res.status(500).json({
    message: 'Something went wrong',
  });
};
