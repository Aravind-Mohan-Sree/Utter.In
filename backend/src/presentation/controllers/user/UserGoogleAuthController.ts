import { NextFunction, Request, Response } from 'express';
import { IUserGoogleAuthUseCase } from '~use-case-interfaces/user/IUserUseCase';
import { env } from '~config/env';
import { cookieData } from '~constants/cookieData';
import { logger } from '~logger/logger';
import { HttpError } from '~errors/HttpError';
import { successMessage } from '~constants/successMessage';

interface IAuthUser {
  email: string;
  googleId: string;
}

export class UserGoogleAuthController {
  constructor(private googleAuth: IUserGoogleAuthUseCase) {}

  handleSuccess = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { email, googleId } = req.user as IAuthUser;

      const user = await this.googleAuth.execute(email, googleId);

      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      res.cookie('accessToken', user.accessToken, {
        ...cookieOptions,
        maxAge: cookieData.ACCESS_TOKEN_AGE,
      });
      res.cookie('refreshToken', user.refreshToken, {
        ...cookieOptions,
        maxAge: cookieData.REFRESH_TOKEN_AGE,
      });
      res.redirect(
        `${env.FRONTEND_URL}/google?id=${encodeURIComponent(user.user.id!)}&name=${encodeURIComponent(user.user.name!)}&email=${encodeURIComponent(user.user.email!)}&role=${encodeURIComponent(user.user.role!)}&responseMessage=${successMessage.SIGNIN_SUCCESS}`,
      );
    } catch (error: unknown) {
      logger.error(error);

      if (error instanceof HttpError) {
        res.redirect(
          `${env.FRONTEND_URL}/signin?mode=user&responseMessage=${error.message}`,
        );
      } else if (error instanceof Error) {
        res.redirect(
          `${env.FRONTEND_URL}/signin?mode=user&responseMessage=${error.message}`,
        );
      }
    }
  };
}
