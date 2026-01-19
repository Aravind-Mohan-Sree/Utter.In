import { NextFunction, Request, Response } from 'express';
import {
  IGetDataUseCase,
  IUserGoogleRegisterUseCase,
  IUserGoogleSigninUseCase,
} from '~use-case-interfaces/user/IUserUseCase';
import { env } from '~config/env';
import { logger } from '~logger/logger';
import { HttpError } from '~errors/HttpError';
import { successMessage } from '~constants/successMessage';
import { IUploadAvatarUseCase } from '~use-case-interfaces/shared/IFileUseCase';

interface IAuthUser {
  name: string;
  avatarUrl: string;
  email: string;
  googleId: string;
}

export class UserGoogleAuthController {
  constructor(
    private getDataUC: IGetDataUseCase,
    private googleRegisterUC: IUserGoogleRegisterUseCase,
    private googleSigninUC: IUserGoogleSigninUseCase,
    private uploadAvatar: IUploadAvatarUseCase,
  ) {}

  handleSuccess = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { name, email, avatarUrl, googleId } = req.user as IAuthUser;
      const user = await this.getDataUC.execute(email);

      if (!user) {
        const id = await this.googleRegisterUC.execute(name, email);

        await this.uploadAvatar.execute('temp/users/avatars/', id, avatarUrl);

        res.redirect(
          `${env.FRONTEND_URL}/signup?mode=user&responseMessage=finishSignup&email=${email}`,
        );
      } else {
        const user = await this.googleSigninUC.execute(email, googleId);

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
          maxAge: parseInt(env.ACCESS_TOKEN_AGE),
        });
        res.cookie('refreshToken', user.refreshToken, {
          ...cookieOptions,
          maxAge: parseInt(env.REFRESH_TOKEN_AGE),
        });
        res.redirect(
          `${env.FRONTEND_URL}/google?id=${encodeURIComponent(user.user.id!)}&name=${encodeURIComponent(user.user.name!)}&email=${encodeURIComponent(user.user.email!)}&role=${encodeURIComponent(user.user.role!)}&responseMessage=${successMessage.SIGNIN_SUCCESS}`,
        );
      }
    } catch (error) {
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
