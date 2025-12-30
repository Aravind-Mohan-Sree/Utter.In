import { NextFunction, Request, Response } from 'express';
import { env } from '~config/env';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';

export class SignoutController {
  signout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        sameSite: isProduction ? 'none' : ('strict' as 'none' | 'strict'),
        secure: isProduction,
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.SIGNOUT_SUCCESS });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
