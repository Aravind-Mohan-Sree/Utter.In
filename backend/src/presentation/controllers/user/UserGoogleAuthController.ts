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
import { filePrefixes } from '~constants/fileConstants';

interface IAuthUser {
  name: string;
  avatarUrl: string;
  email: string;
  googleId: string;
}

export class UserGoogleAuthController {
  constructor(
    private _getDataUC: IGetDataUseCase,
    private _googleRegisterUC: IUserGoogleRegisterUseCase,
    private _googleSigninUC: IUserGoogleSigninUseCase,
    private _uploadAvatar: IUploadAvatarUseCase,
  ) {}

  handleSuccess = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { name, email, avatarUrl, googleId } = req.user as IAuthUser;
      const user = await this._getDataUC.execute(email);

      if (!user) {
        const id = await this._googleRegisterUC.execute(name, email, googleId);

        await this._uploadAvatar.execute(
          filePrefixes.TEMP_USER_AVATAR,
          id,
          avatarUrl,
        );

        res.redirect(
          `${env.FRONTEND_URL}/signup?mode=user&responseMessage=finishSignup&email=${email}`,
        );
      } else {
        const user = await this._googleSigninUC.execute(email, googleId);

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
