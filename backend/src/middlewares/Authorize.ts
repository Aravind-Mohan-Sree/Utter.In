import { NextFunction, Request, Response } from 'express';
import { errorMessage } from '~constants/errorMessage';
import { ForbiddenError } from '~errors/HttpError';
import { logger } from '~logger/logger';

export interface IAuthorize {
  checkRole(
    requiredRole: string,
  ): (req: Request, res: Response, next: NextFunction) => void;
}

export class Authorize implements IAuthorize {
  checkRole(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const { role } = req.user as { role: string };

        if (role !== requiredRole) {
          throw new ForbiddenError(errorMessage.FORBIDDEN);
        }

        next();
      } catch (error) {
        logger.error(error);
        next(error);
      }
    };
  }
}
