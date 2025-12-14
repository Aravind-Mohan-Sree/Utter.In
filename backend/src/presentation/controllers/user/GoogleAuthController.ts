import { NextFunction, Request, Response } from 'express';
import { IGoogleAuthUseCase } from '~use-case-interfaces/user/IUserUseCase';
import { env } from '~config/env';
import { cookieData } from '~constants/cookieData';
import { logger } from '~logger/logger';

interface IAuthUser {
  email: string;
  googleId: string;
}

export class GoogleAuthController {
  constructor(private googleAuth: IGoogleAuthUseCase) {}

  handleSuccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, googleId } = req.user as IAuthUser;

      const user = await this.googleAuth.execute(email, googleId);

      const isProduction = env.NODE_ENV === 'production';

      res.cookie('accessToken', user.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'strict',
        maxAge: cookieData.ACCESS_TOKEN_AGE,
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      });

      res.cookie('refreshToken', user.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'strict',
        maxAge: cookieData.REFRESH_TOKEN_AGE,
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      });

      res.redirect(
        `${env.FRONTEND_URL}/google?id=${encodeURIComponent(user.user.id!)}&name=${encodeURIComponent(user.user.name!)}&email=${encodeURIComponent(user.user.email!)}`,
      );
    } catch (error: unknown) {
      logger.error(error);
      next(error);
    }
  };
}
